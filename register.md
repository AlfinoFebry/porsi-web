This is the flow of registration

1. user register email and password or using google auth on register page.

2. after user successfully register, ask if the user are currently highschool student or alumni. ask in indonesian
"pilih yang mendeskripsikan anda" then theres 2 button 1 siswa SMA and 2 alumni

3. after that goes to biodata tab. theres a form that user should fill. it contains basic information such as name, date of birth, gender. if the user previously select siswa SMA, add column nama sekolah and jurusan SMA and class. if the user 
select alumni in the previous page add nama perguruan tinggi, tahun lulus sma, tahun masuk perguruan tinggi, jurusan/prodi kuliah.

4. then next tab will be inputing student report. this is an api for orc that i build https://api.porsi.me

5. user should input hihgh school report for semester 1 to 4. but if the user are currently class 1, ask for only semester 1 instead.

5. the user can input the mark manually, or can use upload the photo of the student report than the api will return the text of that record to help automatically fill the mark.

6. this is the example of the api response

"text": "Nama Sekolah © SMAN 1 NGANTANG, ~~ ooo 0 Kelas XI MIA 1\nAlamat © JL. JALAN RAYA 253 NGANTANG |, © «= (10 Semester : 2 (Dua)\nNama - ALFINO FEBRY KRISSAPUTRA «1 1 Rit Tahun Pelajaran © 1 2019/2020\nNomor Induk/NISN : 4022 / 0033111578\" NT | IN\nEs ED AG AN TANG Cl A A I Hs a ~ A\nC. KETERAMPILAN NEGERI]\nKriteria Ketuntasan Minimal = 77\nKelompok A\nPendidikan Agama Kristen 88 Memiliki penguasaan keterampilan baik, terutama dalam Membuat proyek berkaitan\nEh dan Budi Pekerti peran keluarga dan sekolah\nPendidikan Pancasila dan c Menmiliki penguasaan keterampilan cukup baik, terutama dalam Merancang penelitian\nEq Kewarganegaraan sederhana potensi ancarman\n; Memiliki penguasaan keterampilan baik, terutama dalam Mendemonstrasikan sebuah\nEd Bahasa Indonesia 87 naskah drama d\n{ Memiliki penguasaan keterampilan baik, terutama dalam Menggunakan pola barisan\nMatematika (Umum) aritmetika atau geometri\n3 z c Memiliki penguasaan keterampilan cukup baik, bahkan terampil dalam Mengolah\nSejarah Indonesia informasi strategi perjuangan bangsa Indonesia\n; Memiliki penguasaan keterampilan baik, terutama dalam Menangkap makna teks\nBl Bahasa Inggris 87 ERENG] explanation lisan dan tulis.\nKelompok B\n: Memiliki penguasaan keterampilan cukup baik, terutama dalam Menganalisis karya\nEd Seni Budaya eo | C Topeng Malang dengan Prosedur Kritik\nPendidikan Jasmani, Memiliki penguasaan keterampilan baik, dalam Mempraktikkan keterampilan senam\nOlahraga, dan Kesehatan lantai cukup terampil\nPrakarya dan Memiliki penguasaan keterampilan sangat baik, terutama dalam Membuat\neda ana an A perencanaan usaha kerajinan dari bahan limbah , terampil dalam Memproduksi\nkerajinan dari bahan limbah bangun ruang\nMuatan Lokal Bahasa Memiliki penguasaan keterampilan baik, dalam Menginterpretasi nilai-nilai moral dalam\nDaerah tembang macapat. cukup terampil\nKelompok C\n1] Matematika (Peminatan) Memiliki penguasaan keterampilan baik, terutama dalam Menyelesaikan masalah\nfaktorisasi polinomial\n[£2 [Brows AN TANG SM 84 Cc. |Meniliki penguasaan keterampilan cukup baik, bahkan terampil dalam Melakukan\nkampanye narkoba\nEE I CAN TANG SMP BEGEREY Memiliki penguasaan keterampilan cukup baik, bahkan terampil dalam Membuat karya\nyang menerapkan prinsip pemantulan & pemblasan\nBR A ane MASE Memiliki penguasaan keterampilan baik, dalam Menyimpulkan hasil analisis data\npercobaan titrasi asam-basa cukup terampil\nBE A Menmiliki penguasaan keterampilan sangat baik, terutama dalam Menyajikan hasil\nanalisis fungsi dan peran APBN dan APBD\nTabel interval predikat berdasarkan KKM\nEh HOA AN AN EEE NEFER\nMala 9 Juni 2020\nWali s,\nASE]\ni, S.P\nNIP. 196602082007011015\nTTT ITT TE Tl IT Ta ET TT TT TT Ty Ir TT ry Tr ie or errr mein\n7 MIA 1 | ALFEINO FEBRY KRISSAPUTRA | 4022\nx. | eRapor SMA | Hal  : 3\n"

7. the mata pelajaran ar differ based on user jurusan

Mata Pelajaran Wajib (Sama untuk semua jurusan)
Pendidikan Agama dan Budi Pekerti

PPKn (Pendidikan Pancasila dan Kewarganegaraan)

Bahasa Indonesia

Matematika Wajib

Sejarah Indonesia

Bahasa Inggris

PJOK (Pendidikan Jasmani, Olahraga, dan Kesehatan)

Prakarya/ Seni Budaya

Mata Pelajaran Peminatan IPA
Matematika Peminatan

Fisika

Kimia

Biologi

🌏 Jurusan IPS (Ilmu Pengetahuan Sosial)
Mata Pelajaran Wajib (Sama seperti jurusan IPA)
Pendidikan Agama dan Budi Pekerti

PPKn

Bahasa Indonesia

Matematika Wajib

Sejarah Indonesia

Bahasa Inggris

PJOK

Prakarya/ Seni Budaya

Mata Pelajaran Peminatan IPS
Geografi

Sejarah

Sosiologi

Ekonomi


8. also add the functionality so user can sellect additional mata pelarajan from another jurusan.

9. store all the data on the supabase database.