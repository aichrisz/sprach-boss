// Sprach-Boss — data vocab
// Format: { de, id, tema, tier }
// tema: hotel | essen | smalltalk | behoerden
// tier: 1 (dasar) | 2 (menengah) | 3 (susah)
const VOCAB = [
  // ===== HOTEL (20) =====
  { de: "die Rechnung", id: "bon / tagihan", tema: "hotel", tier: 1 },
  { de: "der Gast", id: "tamu", tema: "hotel", tier: 1 },
  { de: "das Frühstück", id: "sarapan", tema: "hotel", tier: 1 },
  { de: "das Zimmer", id: "kamar", tema: "hotel", tier: 1 },
  { de: "die Reservierung", id: "reservasi / pemesanan", tema: "hotel", tier: 1 },
  { de: "die Rezeption", id: "meja depan / resepsionis", tema: "hotel", tier: 1 },
  { de: "der Schlüssel", id: "kunci", tema: "hotel", tier: 1 },
  { de: "die Etage", id: "lantai", tema: "hotel", tier: 1 },
  { de: "der Parkplatz", id: "tempat parkir", tema: "hotel", tier: 1 },
  { de: "die Minibar", id: "minibar (lemari minuman)", tema: "hotel", tier: 1 },
  { de: "die Beschwerde", id: "keluhan", tema: "hotel", tier: 2 },
  { de: "das Trinkgeld", id: "tip / uang tip", tema: "hotel", tier: 2 },
  { de: "das Gepäck", id: "bagasi / barang bawaan", tema: "hotel", tier: 2 },
  { de: "die Anmeldung", id: "pendaftaran / registrasi", tema: "hotel", tier: 2 },
  { de: "das Housekeeping", id: "tata graha / kebersihan kamar", tema: "hotel", tier: 2 },
  { de: "das Frühstücksbuffet", id: "prasmanan sarapan", tema: "hotel", tier: 2 },
  { de: "die Abreise", id: "keberangkatan / check-out", tema: "hotel", tier: 3 },
  { de: "die Übernachtung", id: "menginap semalam", tema: "hotel", tier: 3 },
  { de: "der Zimmerservice", id: "layanan kamar", tema: "hotel", tier: 3 },
  { de: "die Verfügbarkeit", id: "ketersediaan", tema: "hotel", tier: 3 },

  // ===== ESSEN (20) =====
  { de: "die Bratwurst", id: "sosis panggang", tema: "essen", tier: 1 },
  { de: "das Schnitzel", id: "schnitzel (daging pipih goreng)", tema: "essen", tier: 1 },
  { de: "die Beilage", id: "lauk pendamping", tema: "essen", tier: 1 },
  { de: "vegetarisch", id: "vegetarian", tema: "essen", tier: 1 },
  { de: "die Speisekarte", id: "menu / daftar makanan", tema: "essen", tier: 1 },
  { de: "bestellen", id: "memesan", tema: "essen", tier: 1 },
  { de: "der Durst", id: "haus", tema: "essen", tier: 1 },
  { de: "lecker", id: "enak / lezat", tema: "essen", tier: 1 },
  { de: "scharf", id: "pedas", tema: "essen", tier: 1 },
  { de: "satt", id: "kenyang", tema: "essen", tier: 1 },
  { de: "die Allergie", id: "alergi", tema: "essen", tier: 2 },
  { de: "das Hauptgericht", id: "hidangan utama", tema: "essen", tier: 2 },
  { de: "die Nachspeise", id: "makanan penutup / dessert", tema: "essen", tier: 2 },
  { de: "die Vorspeise", id: "hidangan pembuka", tema: "essen", tier: 2 },
  { de: "das Getränk", id: "minuman", tema: "essen", tier: 2 },
  { de: "der Kellner", id: "pelayan (pria)", tema: "essen", tier: 2 },
  { de: "der Geschmack", id: "rasa / cita rasa", tema: "essen", tier: 3 },
  { de: "der Tisch reservieren", id: "memesan meja", tema: "essen", tier: 3 },
  { de: "das Trinkgeld geben", id: "memberi tip", tema: "essen", tier: 3 },
  { de: "die Portion", id: "porsi", tema: "essen", tier: 3 },

  // ===== SMALLTALK (20) =====
  { de: "Hallo", id: "halo", tema: "smalltalk", tier: 1 },
  { de: "Tschüss", id: "dadah / sampai jumpa", tema: "smalltalk", tier: 1 },
  { de: "Danke", id: "terima kasih", tema: "smalltalk", tier: 1 },
  { de: "Bitte", id: "sama-sama / silakan / tolong", tema: "smalltalk", tier: 1 },
  { de: "Entschuldigung", id: "maaf / permisi", tema: "smalltalk", tier: 1 },
  { de: "Verstanden", id: "paham / mengerti", tema: "smalltalk", tier: 1 },
  { de: "Kein Problem", id: "tidak masalah", tema: "smalltalk", tier: 1 },
  { de: "Klar", id: "jelas / tentu", tema: "smalltalk", tier: 1 },
  { de: "Genau", id: "tepat / benar", tema: "smalltalk", tier: 1 },
  { de: "Echt?", id: "serius? / beneran?", tema: "smalltalk", tier: 1 },
  { de: "Na ja", id: "ya gitu deh / begitulah", tema: "smalltalk", tier: 2 },
  { de: "Vielleicht", id: "mungkin", tema: "smalltalk", tier: 2 },
  { de: "Quatsch", id: "omong kosong / becanda", tema: "smalltalk", tier: 2 },
  { de: "Keine Ahnung", id: "tidak tahu / gak ngerti", tema: "smalltalk", tier: 2 },
  { de: "Das ist cool", id: "itu keren", tema: "smalltalk", tier: 2 },
  { de: "Bis später", id: "sampai nanti", tema: "smalltalk", tier: 2 },
  { de: "Schönen Tag noch", id: "semoga harimu menyenangkan", tema: "smalltalk", tier: 3 },
  { de: "Herzlichen Glückwunsch", id: "selamat (ucapan)", tema: "smalltalk", tier: 3 },
  { de: "Wie geht's?", id: "apa kabar?", tema: "smalltalk", tier: 3 },
  { de: "Gern geschehen", id: "sama-sama (formal)", tema: "smalltalk", tier: 3 },

  // ===== BEHOERDEN (20) =====
  { de: "der Termin", id: "janji temu / appointment", tema: "behoerden", tier: 1 },
  { de: "das Formular", id: "formulir", tema: "behoerden", tier: 1 },
  { de: "der Antrag", id: "permohonan / pengajuan", tema: "behoerden", tier: 1 },
  { de: "die Gebühr", id: "biaya / retribusi", tema: "behoerden", tier: 1 },
  { de: "die Frist", id: "batas waktu / tenggat", tema: "behoerden", tier: 1 },
  { de: "der Bescheid", id: "surat keputusan / pemberitahuan", tema: "behoerden", tier: 1 },
  { de: "der Ausweis", id: "kartu identitas", tema: "behoerden", tier: 1 },
  { de: "die Unterschrift", id: "tanda tangan", tema: "behoerden", tier: 1 },
  { de: "die Bestätigung", id: "konfirmasi / bukti", tema: "behoerden", tier: 1 },
  { de: "der Nachweis", id: "bukti / sertifikat", tema: "behoerden", tier: 1 },
  { de: "die Versicherung", id: "asuransi", tema: "behoerden", tier: 2 },
  { de: "die Steuernummer", id: "nomor pajak", tema: "behoerden", tier: 2 },
  { de: "das Konto", id: "rekening (bank)", tema: "behoerden", tier: 2 },
  { de: "der Mietvertrag", id: "kontrak sewa", tema: "behoerden", tier: 2 },
  { de: "der Arbeitsvertrag", id: "kontrak kerja", tema: "behoerden", tier: 2 },
  { de: "das Einwohnermeldeamt", id: "kantor registrasi penduduk", tema: "behoerden", tier: 2 },
  { de: "der Aufenthaltstitel", id: "izin tinggal", tema: "behoerden", tier: 3 },
  { de: "die Fristverlängerung", id: "perpanjangan tenggat", tema: "behoerden", tier: 3 },
  { de: "der Widerspruch", id: "keberatan / sanggahan", tema: "behoerden", tier: 3 },
  { de: "die Aufenthaltserlaubnis", id: "izin menetap", tema: "behoerden", tier: 3 }
];

// ===== Helpers (dipakai app.js & test.js) =====
const TEMAS = ["hotel", "essen", "smalltalk", "behoerden"];
const TIERS = [1, 2, 3];

function vocabByTema(tema) {
  return VOCAB.filter(v => v.tema === tema);
}

function vocabByTier(tema, tier) {
  return VOCAB.filter(v => v.tema === tema && v.tier === tier);
}

// Ekspor untuk Node (test.js); di browser jadi global
if (typeof module !== "undefined" && module.exports) {
  module.exports = { VOCAB, TEMAS, TIERS, vocabByTema, vocabByTier };
}
