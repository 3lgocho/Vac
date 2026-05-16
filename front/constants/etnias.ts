// front/constants/etnias.ts

export interface EtniaItem {
    id: string;
    label: string;      // Lo que ve el usuario en la UI
    value: string;      // Lo que se envía a la base de datos de Rust
}

export const ETNIAS_INDIGENAS: EtniaItem[] = [
    { id: '01', label: '01 Akawaio', value: 'akawaio' },
    { id: '02', label: '02 Añu (Paraujano)', value: 'anu' },
    { id: '03', label: '03 Arawak (Lokono)', value: 'arawak' },
    { id: '04', label: '04 Ayamán', value: 'ayaman' },
    { id: '05', label: '05 Baniva', value: 'baniva' },
    { id: '06', label: '06 Baré', value: 'bare' },
    { id: '07', label: '07 Barí', value: 'bari' },
    { id: '08', label: '08 Catmensa', value: 'catmensa' },
    { id: '09', label: '09 Chaima', value: 'chaima' },
    { id: '10', label: '10 Chiriana', value: 'chiriana' },
    { id: '11', label: '11 Cubeo', value: 'cubeo' },
    { id: '12', label: '12 Cumanagoto', value: 'cumanagoto' },
    { id: '13', label: '13 Eñepa (Panare)', value: 'enepa' },
    { id: '14', label: '14 Gayón', value: 'gayon' },
    { id: '15', label: '15 Guanono', value: 'guanono' },
    { id: '16', label: '16 Hoti', value: 'hoti' },
    { id: '17', label: '17 Inga', value: 'inga' },
    { id: '18', label: '18 Japreira', value: 'japreira' },
    { id: '19', label: '19 Jiwi (Guajibo, Amorua Sikwani)', value: 'jiwi' },
    { id: '20', label: '20 Kari´ña', value: 'karina' },
    { id: '21', label: '21 Kuiba', value: 'kuiba' },
    { id: '22', label: '22 Kurripaco', value: 'kurripaco' },
    { id: '23', label: '23 Mako', value: 'mako' },
    { id: '24', label: '24 Mapoyo (Wanai)', value: 'mapoyo' },
    { id: '25', label: '25 Pemón (Taurepan, Arekuna Kamarakoto)', value: 'pemon' },
    { id: '26', label: '26 Piapoco (Chase)', value: 'piapoco' },
    { id: '27', label: '27 Piaroa (Wotjuja)', value: 'piaroa' },
    { id: '28', label: '28 Puinave', value: 'puinave' },
    { id: '29', label: '29 Pumé (Yaruro)', value: 'pume' },
    { id: '30', label: '30 Putumayo', value: 'putumayo' },
    { id: '31', label: '31 Sáliva', value: 'saliva' },
    { id: '32', label: '32 Sánema (Sanûma)', value: 'sanema' },
    { id: '33', label: '33 Sapé', value: 'sape' },
    { id: '34', label: '34 Timoto Cuicas', value: 'timoto_cuicas' },
    { id: '35', label: '35 Tomusa', value: 'tomusa' },
    { id: '36', label: '36 Uruak (Arutani)', value: 'uruak' },
    { id: '37', label: '37 Warao', value: 'warao' },
    { id: '38', label: '38 Warekena', value: 'warekena' },
    { id: '39', label: '39 Wayúu (GuaSample)', value: 'wayuu' },
    { id: '40', label: '40 Yabarana', value: 'yabarana' },
    { id: '41', label: '41 Yanomami (Shiriana, Guaica o Waika)', value: 'yanomami' },
    { id: '42', label: '42 Yek´uana (Makiritare)', value: 'yekuana' },
    { id: '43', label: '43 Yeral (Flengatu)', value: 'yeral' },
    { id: '44', label: '44 Yukpa', value: 'yukpa' }
];