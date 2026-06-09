CREATE TABLE temp_old_esquema_dosis (
    id INTEGER,
    biologico_id INTEGER,
    nombre_dosis VARCHAR(50),
    orden_aplicacion INTEGER
);

COPY temp_old_esquema_dosis (id, biologico_id, nombre_dosis, orden_aplicacion) FROM stdin;
1	1	DU	1
3	3	1D	1
4	3	2D	2
5	4	1D	1
6	4	2D	2
7	4	3D	3
13	7	1D	1
14	7	1REF	2
15	6	DU	1
17	2	1D	1
18	2	2D	2
19	2	3D	3
20	4	1REF	4
21	4	2REF	5
22	4	DA	6
23	5	1D	1
24	5	2D	2
25	5	3D	3
26	7	2D	3
27	7	DA	4
28	8	1D	1
29	8	2D	2
30	8	3D	3
31	8	1REF	4
32	8	2REF	5
33	8	3REF	6
34	8	DA	7
35	9	1D	1
36	9	2D	2
37	9	3D	3
38	9	1REF	4
39	9	2REF	5
40	9	DA	6
41	10	1D	1
42	10	2D	2
43	10	3D	3
44	10	1REF	4
45	10	2REF	5
46	10	DA	6
47	11	1D	1
48	11	2D	2
49	11	1REF	3
50	11	DA	4
51	12	1D	1
52	12	1REF	2
53	13	1D	1
54	13	2D	2
55	14	1D	1
56	14	2D	2
57	14	3D	3
58	15	1D	1
59	15	2D	2
60	15	3D	3
61	15	4D	4
62	15	5D	5
63	15	6D	6
64	15	7D	7
\.

UPDATE paciente_vacunas pv
SET dosis_id = new_ed.id
FROM temp_old_esquema_dosis old_ed
JOIN esquema_dosis new_ed ON old_ed.biologico_id = new_ed.biologico_id AND old_ed.nombre_dosis = new_ed.nombre_dosis
WHERE pv.dosis_id = old_ed.id;

DROP TABLE temp_old_esquema_dosis;
