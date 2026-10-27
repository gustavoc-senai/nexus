-- Generated from the spatial geometry curriculum. Do not edit answers by hand.
insert into nexus_private.catalog(id, position, answers) values
('energia', 0, '[0,2,2,3,4,52]'::jsonb),
('hangar', 1, '[216,120,3000,60,30,108]'::jsonb),
('oficina', 2, '[96,62,48,48,30,45]'::jsonb),
('navegacao', 3, '[2,1,1,2,8,5,6,64,240,12,360,120]'::jsonb),
('comunicacao', 4, '[2,2,1,2,6,15]'::jsonb),
('suporte', 5, '[2,2,1,2,4,36]'::jsonb),
('observatorio', 6, '[13,216,300,400,8,288]'::jsonb),
('laboratorio', 7, '[162,198,84,40,76,152]'::jsonb),
('doca', 8, '[216,600,96,61,3,24]'::jsonb),
('modulos', 9, '[25,343,108,140,5,6]'::jsonb),
('reservatorios', 10, '[5,48,108,96,2500,4]'::jsonb),
('bases', 11, '[7,64,216,160,128,208]'::jsonb),
('antenas', 12, '[13,15,195,270,180,15]'::jsonb),
('calibracao', 13, '[10,384,5,216,1080,216]'::jsonb),
('expedicao', 14, '[512,500,5,27,236,648]'::jsonb)
on conflict(id) do update set position=excluded.position, answers=excluded.answers;
