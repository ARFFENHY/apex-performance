BEGIN;
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Ab wheel rollout', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/ab-wheel-rollout.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Aperturas con mancuernas plano', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/aperturas-con-mancuernas-plano.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Aperturas declinadas con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/aperturas-declinadas-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Aperturas en polea', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/aperturas-en-polea.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Aperturas inclinadas con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/aperturas-inclinadas-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Cruce de poleas alto', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/cruce-de-poleas-alto.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Cruce de poleas bajo', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/cruce-de-poleas-bajo.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl alterno con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-alterno-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl con barra EZ', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-con-barra-ez.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl con barra Z', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-con-barra-z.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl con cable a una mano', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-con-cable-a-una-mano.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl con mancuernas alterno', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-con-mancuernas-alterno.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl concentrado', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-concentrado.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl concentrado', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-concentrado.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl en polea baja', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-en-polea-baja.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl martillo', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-martillo.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl martillo', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-martillo.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Curl spider con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/curl-spider-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas asistidas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-asistidas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas con lastre', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-con-lastre.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas explosivas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-explosivas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas negativas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-negativas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas tipo archer', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-tipo-archer.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Dominadas asistidas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/dominadas-asistidas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones frontales alternas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-frontales-alternas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones frontales con disco', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-frontales-con-disco.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones frontales con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-frontales-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones laterales con banda', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-laterales-con-banda.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones laterales inclinadas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-laterales-inclinadas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones laterales en polea', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-laterales-en-polea.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Elevaciones YTWL', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/elevaciones-ytwl.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Encogimientos con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/encogimientos-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Encogimientos con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/encogimientos-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Encogimientos de hombros', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/encogimientos-de-hombros.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Face pull', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/face-pull.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Face pull con cuerda', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/face-pull-con-cuerda.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Face pull', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/face-pull.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones a una mano', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-a-una-mano.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones con agarre cerrado', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-con-agarre-cerrado.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones con banda', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-con-banda.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones con palmada', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-con-palmada.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones explosivas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-explosivas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones tipo archer', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-tipo-archer.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Flexiones de pecho', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/flexiones-de-pecho.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Handstand push-up', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/handstand-push-up.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Hiperextensiones', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/hiperextensiones.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Hiperextensiones', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/hiperextensiones.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Mountain climbers', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/mountain-climbers.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Peso muerto a una pierna', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/peso-muerto-a-una-pierna.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Peso muerto rumano con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/peso-muerto-rumano-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Peso muerto sumo', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/peso-muerto-sumo.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Peso muerto sumo', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/peso-muerto-sumo.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Pike push-up', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/pike-push-up.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press Arnold', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-arnold.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press Arnold', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-arnold.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press Arnold', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-arnold.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press con kettlebell', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-con-kettlebell.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press de banca con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-de-banca-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press de pecho con agarre neutro', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-de-pecho-con-agarre-neutro.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press de pecho con pausa', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-de-pecho-con-pausa.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press declinado con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-declinado-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press declinado con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-declinado-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press inclinado con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-inclinado-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press militar con barra de pie', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-militar-con-barra-de-pie.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press militar con mancuernas', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-militar-con-mancuernas.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press militar de pie', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-militar-de-pie.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press militar sentado con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-militar-sentado-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Press militar de pie', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/press-militar-de-pie.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Pull-over con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/pull-over-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Pullover con mancuerna', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/pullover-con-mancuerna.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Pullover en polea alta', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/pullover-en-polea-alta.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Pull-over con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/pull-over-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Push press', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/push-press.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Push press', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/push-press.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo al cuello con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-al-cuello-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo alto con barra', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-alto-con-barra.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo con barra T agarre estrecho', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-con-barra-t-agarre-estrecho.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo con barra agarre prono', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-con-barra-agarre-prono.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo con mancuerna en banco', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-con-mancuerna-en-banco.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo con mancuerna en banco', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-con-mancuerna-en-banco.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo en polea baja', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-en-polea-baja.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo en TRX', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-en-trx.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo invertido (australian pull-up)', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-invertido-australian-pull-up.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Remo pendlay', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/remo-pendlay.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Rotaciones externas con banda', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/rotaciones-externas-con-banda.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Russian twist', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/russian-twist.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, source) 
VALUES ('Sentadilla hack', 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/sentadilla-hack.jpg', 'start', 'male', 'manual')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url, source = 'manual';
COMMIT;
