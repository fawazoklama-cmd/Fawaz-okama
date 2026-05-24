import { Language } from './types';

export const translations = {
  en: {
    appName: "FawMan Playground",
    tagline: "A clean space for two people to play together.",
    disclaimer: "Friendly, smooth, and accessible. Absolutely no login or accounts required.",
    noRomanticDisclaimer: "Friendly multiplayer connection. Safe environment without romantic, match-making or couple symbols.",
    
    // Navigation
    navHome: "Home",
    navGames: "Games Library",
    navVoice: "Voice Chat Room",
    navProfile: "My Profile",
    navAbout: "About FawMan",
    navSettings: "Settings",
    
    // Actions
    createRoom: "Create Room",
    joinRoom: "Join Room",
    enterCode: "Enter 6-digit room code",
    joinBtn: "Join",
    backToHome: "Back to Home",
    saveProfile: "Save Profile Settings",
    randomize: "Randomize Avatar",
    searchPlaceholder: "Search games...",
    allCategories: "All Categories",
    leaveRoom: "Leave Room",
    selectGame: "Select Game",
    playNow: "Play Game",
    quickStart: "Quick Start Game",
    
    // Profile Fields
    profileTitle: "Profile Customization",
    profileDesc: "Personalize your virtual identity. Everything stays on your local browser storage.",
    usernameLabel: "Username / Player Name",
    avatarShapeLabel: "Avatar Shape",
    avatarColorLabel: "Avatar Base Vibe",
    emojiTagLabel: "Emoji Expression",
    shapeCircle: "Circle Cloud",
    shapeSquare: "Smooth Box",
    shapeCloud: "Abstract Cloud",
    shapeBlob: "Splat Blob",
    colorBlue: "Faw Blue Theme",
    colorPink: "Man Pink Theme",
    colorWhite: "Minimalist Cream",

    // Room labels
    roomCode: "Room Code",
    players: "Players",
    roomTitle: "Game Room Lobby",
    activeRoomStatus: "Active Multiplayer Room",
    shareCodePrompt: "Share this 6-digit code with your play companion to load real-time sync:",
    playersInRoom: "Players Connected",
    noCompanionYet: "Waiting for your partner to join...",
    chatHistory: "Lobby Quick Messages",
    typeMsgPlaceholder: "Type a companion chat message...",
    sendBtn: "Send",
    gameSelectionHeader: "Select from 50 Live Games",
    playingGame: "Currently Playing",
    
    // Voice Chat page
    voiceChatTitle: "On-Mic Voice Chat Room",
    voiceChatDesc: "Pure high-performance audio communication channel with noise cancellation.",
    micToggle: "Microphone Active",
    micOn: "Mic is LIVE",
    micOff: "Mic is MUTED",
    pttToggleName: "Push-To-Talk Mode",
    noiseReductionName: "Acoustic Noise Reduction",
    noiseReductionOn: "Noise Gate ON",
    noAudioPermission: "Please grant microphone permissions in your browser frame to enable live audio level visuals.",
    voiceActiveIndicator: "Audio Stream Decibel Meter",
    speakingStatus: "Speaking Active",

    // About Page
    aboutTitle: "About FawMan Playground",
    aboutIntro: "FawMan Playground is designed as a pristine digital harbor representing two friendly minds: Faw (embodied in deep Sky Blue) and Man (embodied in soft Cotton Pink). The project centers on providing a highly aesthetic, responsive, and completely platonic gaming and sharing space without cumbersome configurations or tracking.",
    aboutBlueFaw: "Faw (Deep Blue): Represents rational calmness, deep horizons, and spacious navigation logic.",
    aboutPinkMan: "Man (Soft Pink): Represents creative softness, cozy playfulness, and high-contrast responsive joy.",
    aboutGoal: "No algorithms, no logins, no romance trackers. Only raw friendly gaming across 50 detailed mini-games, integrated with ultra-low latency simulated voice-activity and real-time state broadcasts.",

    // Settings
    settingsTitle: "Settings & Preferences",
    settingsLanguage: "Platform Language",
    resetData: "Clear Local Data & Cache",
    resetDataBtn: "Reset Data",
    dataClearedMsg: "All profiles and localStorage elements cleared. Setting up default avatar states.",
    credits: "FawMan Playground version 2.4.0 • Crafted under modern high-performance design specifications.",

    // Game Win conditions / turns
    playerTurn: "Player Turn",
    yourTurn: "Your Turn!",
    opponentTurn: "Partner's Turn",
    victoryLabel: "Victory Achieved!",
    drawLabel: "Draw Match!",
    restartGame: "Reset Game State",
    coopGoal: "Cooperative Objective",
    scoreLabel: "Score"
  },
  id: {
    appName: "FawMan Playground",
    tagline: "Ruang bersih untuk bermain bersama bagi dua orang teman.",
    disclaimer: "Ramah, mulus, dan mudah diakses. Sama sekali tidak memerlukan pendaftaran atau login.",
    noRomanticDisclaimer: "Koneksi multiplayer persahabatan. Lingkungan aman tanpa simbol romantis, mak comblang, atau lambang cinta.",
    
    // Navigation
    navHome: "Beranda",
    navGames: "Perpustakaan Game",
    navVoice: "Ruang Obrolan Suara",
    navProfile: "Profil Saya",
    navAbout: "Tentang FawMan",
    navSettings: "Pengaturan",
    
    // Actions
    createRoom: "Buat Ruangan",
    joinRoom: "Gabung Ruangan",
    enterCode: "Masukkan 6 digit kode ruangan",
    joinBtn: "Gabung",
    backToHome: "Kembali ke Beranda",
    saveProfile: "Simpan Pengaturan Profil",
    randomize: "Acak Avatar",
    searchPlaceholder: "Cari permainan...",
    allCategories: "Semua Kategori",
    leaveRoom: "Tinggalkan Ruangan",
    selectGame: "Pilih Game",
    playNow: "Mainkan Game",
    quickStart: "Mulai Cepat",
    
    // Profile Fields
    profileTitle: "Kustomisasi Profil",
    profileDesc: "Personalisasikan identitas virtual Anda. Semua data disimpan secara lokal di browser Anda.",
    usernameLabel: "Nama Pengguna / Player",
    avatarShapeLabel: "Bentuk Avatar",
    avatarColorLabel: "Tema Vibe Avatar",
    emojiTagLabel: "Ekspresi Emoji",
    shapeCircle: "Awan Melingkar",
    shapeSquare: "Kotak Halus",
    shapeCloud: "Awan Abstrak",
    shapeBlob: "Blob Coretan",
    colorBlue: "Tema Biru Faw",
    colorPink: "Tema Pink Man",
    colorWhite: "Krim Minimalis",

    // Room labels
    roomCode: "Kode Ruangan",
    players: "Pemain",
    roomTitle: "Lobi Ruang Permainan",
    activeRoomStatus: "Ruangan Multiplayer Aktif",
    shareCodePrompt: "Bagikan 6 digit kode ini kepada teman bermain untuk menyinkronkan permainan secara real-time:",
    playersInRoom: "Pemain Terkoneksi",
    noCompanionYet: "Menunggu teman bermain bergabung...",
    chatHistory: "Pesan Instan Lobi",
    typeMsgPlaceholder: "Ketik pesan cepat kepada teman...",
    sendBtn: "Kirim",
    gameSelectionHeader: "Pilih dari 50 Game Aktif",
    playingGame: "Sedang Dimainkan",
    
    // Voice Chat page
    voiceChatTitle: "Obrolan Suara Aktif",
    voiceChatDesc: "Saluran komunikasi audio berkinerja tinggi dengan peredam kebisingan bawaan.",
    micToggle: "Mikrofon Aktif",
    micOn: "Mikrofon AKTIF",
    micOff: "Mikrofon SENYAP",
    pttToggleName: "Mode Tekan-untuk-Bicara",
    noiseReductionName: "Peredam Kebisingan Akustik",
    noiseReductionOn: "Peredam Kebisingan AKTIF",
    noAudioPermission: "Mohon berikan izin penggunaan mikrofon di browser Anda untuk mengaktifkan visualisasi tingkat audio sesungguhnya.",
    voiceActiveIndicator: "Pengukur Desibel Gelombang Audio",
    speakingStatus: "Sedang Berbicara",

    // About Page
    aboutTitle: "Tentang FawMan Playground",
    aboutIntro: "FawMan Playground dirancang sebagai pelabuhan digital asri yang melambangkan dua pemikiran yang selaras: Faw (direpresentasikan dengan Biru Langit yang jernih) dan Man (direpresentasikan dengan Pink Katun yang lembut). Proyek ini berfokus pada penyediaan ruang bermain platonic yang estetis, responsif, dan sepenuhnya ramah lingkungan tanpa kerumitan penginstalan.",
    aboutBlueFaw: "Faw (Biru Tua): Melambangkan ketenangan rasional, cakrawala dalam, dan logika navigasi yang luas.",
    aboutPinkMan: "Man (Pink Lembut): Melambangkan kelembutan kreatif, kegembiraan yang nyaman, dan respon visual berenergi tinggi.",
    aboutGoal: "Tanpa algoritma pelacak, tanpa masuk akun, tanpa bumbu cinta. Hanya murni permainan multiplayer di 50 mini-games, terintegrasi dengan simulasi aktivitas suara berlatensi super rendah serta penyiaran status real-time.",

    // Settings
    settingsTitle: "Pengaturan & Preferensi",
    settingsLanguage: "Bahasa Platform",
    resetData: "Hapus Cache & Data Lokal",
    resetDataBtn: "Hapus Data",
    dataClearedMsg: "Semua profil lokal dibersihkan. Memasang ulang pengaturan identitas default.",
    credits: "FawMan Playground versi 2.4.0 • Dibuat dengan presisi visual spesifikasi modern.",

    // Game Win conditions / turns
    playerTurn: "Giliran Bermain",
    yourTurn: "Giliran Anda!",
    opponentTurn: "Giliran Pasangan",
    victoryLabel: "Meraih Kemenangan!",
    drawLabel: "Permainan Seri!",
    restartGame: "Reset Permainan",
    coopGoal: "Tujuan Kerja Sama",
    scoreLabel: "Skor"
  }
};
