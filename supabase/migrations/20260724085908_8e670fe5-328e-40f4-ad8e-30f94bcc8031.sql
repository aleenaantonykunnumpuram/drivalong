
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('customer','driver','admin');
CREATE TYPE public.booking_status AS ENUM ('pending','assigned','started','completed','cancelled');
CREATE TYPE public.trip_type AS ENUM ('one_way','round_trip','hourly','outstation');
CREATE TYPE public.vehicle_category AS ENUM ('hatchback','sedan','suv','luxury','ev');
CREATE TYPE public.transmission AS ENUM ('manual','automatic');
CREATE TYPE public.kyc_status AS ENUM ('pending','approved','rejected');
CREATE TYPE public.payment_status AS ENUM ('created','authorized','captured','failed','refunded');
CREATE TYPE public.payment_provider AS ENUM ('razorpay','cash');

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ USER_ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-create profile + customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ VEHICLES (catalog) ============
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category vehicle_category NOT NULL,
  display_name text NOT NULL,
  transmission transmission NOT NULL DEFAULT 'manual',
  capacity int NOT NULL DEFAULT 4,
  base_fare numeric(10,2) NOT NULL DEFAULT 0,
  per_km numeric(10,2) NOT NULL DEFAULT 0,
  per_min numeric(10,2) NOT NULL DEFAULT 0,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon, authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read vehicles" ON public.vehicles FOR SELECT USING (is_active);
CREATE POLICY "admin manage vehicles" ON public.vehicles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER vehicles_updated BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRICING RULES ============
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL DEFAULT 'default',
  surge_multiplier numeric(4,2) NOT NULL DEFAULT 1.0,
  min_fare numeric(10,2) NOT NULL DEFAULT 99,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_rules TO anon, authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pricing" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "admin manage pricing" ON public.pricing_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ DRIVERS ============
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number text UNIQUE,
  kyc_status kyc_status NOT NULL DEFAULT 'pending',
  rating numeric(3,2) NOT NULL DEFAULT 5.0,
  total_trips int NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  assigned_vehicle_id uuid REFERENCES public.vehicles(id),
  current_lat numeric(10,7),
  current_lng numeric(10,7),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver read self" ON public.drivers FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "driver update self" ON public.drivers FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "driver insert self" ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND public.has_role(auth.uid(),'driver'));
CREATE POLICY "admin manage drivers" ON public.drivers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER drivers_updated BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id),
  vehicle_category vehicle_category NOT NULL,
  trip_type trip_type NOT NULL,
  transmission transmission NOT NULL DEFAULT 'manual',
  pickup_address text NOT NULL,
  pickup_lat numeric(10,7),
  pickup_lng numeric(10,7),
  drop_address text,
  drop_lat numeric(10,7),
  drop_lng numeric(10,7),
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  estimated_km numeric(8,2),
  estimated_minutes int,
  fare_estimate numeric(10,2) NOT NULL,
  final_fare numeric(10,2),
  status booking_status NOT NULL DEFAULT 'pending',
  otp text NOT NULL DEFAULT lpad(floor(random()*10000)::text,4,'0'),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_customer_idx ON public.bookings(customer_id, created_at DESC);
CREATE INDEX bookings_driver_idx ON public.bookings(driver_id, created_at DESC);
CREATE INDEX bookings_status_idx ON public.bookings(status);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer read own bookings" ON public.bookings FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = driver_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "customer create booking" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "customer update own booking" ON public.bookings FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id OR auth.uid() = driver_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = driver_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BOOKING EVENTS ============
CREATE TABLE public.booking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  event text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_events_booking_idx ON public.booking_events(booking_id, created_at DESC);
GRANT SELECT, INSERT ON public.booking_events TO authenticated;
GRANT ALL ON public.booking_events TO service_role;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties read events" ON public.booking_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id
    AND (b.customer_id = auth.uid() OR b.driver_id = auth.uid()))
    OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "parties insert events" ON public.booking_events FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND (b.customer_id = auth.uid() OR b.driver_id = auth.uid())));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL DEFAULT 'razorpay',
  provider_order_id text,
  provider_payment_id text,
  provider_signature text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'created',
  webhook_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_booking_idx ON public.payments(booking_id);
CREATE INDEX payments_order_idx ON public.payments(provider_order_id);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties read payments" ON public.payments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id
    AND (b.customer_id = auth.uid() OR b.driver_id = auth.uid()))
    OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DRIVER LOCATIONS (realtime) ============
CREATE TABLE public.driver_locations (
  id bigserial PRIMARY KEY,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  lat numeric(10,7) NOT NULL,
  lng numeric(10,7) NOT NULL,
  heading numeric(5,2),
  speed_kph numeric(5,2),
  ts timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX driver_locations_driver_ts_idx ON public.driver_locations(driver_id, ts DESC);
GRANT SELECT, INSERT ON public.driver_locations TO authenticated;
GRANT ALL ON public.driver_locations TO service_role;
ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "driver write own location" ON public.driver_locations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "read location if party or admin" ON public.driver_locations FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR auth.uid() = driver_id
    OR EXISTS (SELECT 1 FROM public.bookings b
      WHERE b.driver_id = driver_locations.driver_id
        AND b.customer_id = auth.uid()
        AND b.status IN ('assigned','started'))
  );
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_driver_idx ON public.reviews(driver_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "customer write own review" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id AND EXISTS (
    SELECT 1 FROM public.bookings b WHERE b.id = booking_id
      AND b.customer_id = auth.uid() AND b.status = 'completed'));
CREATE POLICY "customer update own review" ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

-- ============ SEED CATALOG ============
INSERT INTO public.vehicles (category, display_name, transmission, capacity, base_fare, per_km, per_min, hourly_rate) VALUES
  ('hatchback','Hatchback','manual',4, 79,  11, 1.5, 249),
  ('sedan',    'Sedan',    'manual',4, 99,  13, 1.8, 299),
  ('sedan',    'Sedan AT', 'automatic',4, 119, 14, 2.0, 349),
  ('suv',      'SUV',      'manual',6, 149, 17, 2.2, 449),
  ('luxury',   'Luxury',   'automatic',4, 249, 28, 3.0, 799),
  ('ev',       'Electric', 'automatic',4, 129, 12, 1.7, 379);

INSERT INTO public.pricing_rules (city, surge_multiplier, min_fare) VALUES ('default', 1.0, 99);
