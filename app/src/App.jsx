import { useState, useCallback, useRef, useEffect } from "react";
import { BRAND } from "./lib/config.js";
import { useAuth } from "./lib/auth.jsx";
import { useCustomCards } from "./lib/useCustomCards.js";
import { useProgress } from "./lib/useProgress.js";
import { useSpeech } from "./lib/useSpeech.js";
import { useSpeechRecognition } from "./lib/useSpeechRecognition.js";
import { usePro, FREE_LIMITS, PRO_LIMITS } from "./lib/usePro.js";
import { useSrs, srsKey } from "./lib/useSrs.js";
import Paywall from "./components/Paywall.jsx";
import AccountScreen from "./components/AccountScreen.jsx";

// ============================================================
// DATA
// ============================================================

const HIRAGANA_ROWS = [
  { name: "A-row", chars: [{ char: "あ", romaji: "a" }, { char: "い", romaji: "i" }, { char: "う", romaji: "u" }, { char: "え", romaji: "e" }, { char: "お", romaji: "o" }] },
  { name: "K-row", chars: [{ char: "か", romaji: "ka" }, { char: "き", romaji: "ki" }, { char: "く", romaji: "ku" }, { char: "け", romaji: "ke" }, { char: "こ", romaji: "ko" }] },
  { name: "S-row", chars: [{ char: "さ", romaji: "sa" }, { char: "し", romaji: "shi" }, { char: "す", romaji: "su" }, { char: "せ", romaji: "se" }, { char: "そ", romaji: "so" }] },
  { name: "T-row", chars: [{ char: "た", romaji: "ta" }, { char: "ち", romaji: "chi" }, { char: "つ", romaji: "tsu" }, { char: "て", romaji: "te" }, { char: "と", romaji: "to" }] },
  { name: "N-row", chars: [{ char: "な", romaji: "na" }, { char: "に", romaji: "ni" }, { char: "ぬ", romaji: "nu" }, { char: "ね", romaji: "ne" }, { char: "の", romaji: "no" }] },
  { name: "H-row", chars: [{ char: "は", romaji: "ha" }, { char: "ひ", romaji: "hi" }, { char: "ふ", romaji: "fu" }, { char: "へ", romaji: "he" }, { char: "ほ", romaji: "ho" }] },
  { name: "M-row", chars: [{ char: "ま", romaji: "ma" }, { char: "み", romaji: "mi" }, { char: "む", romaji: "mu" }, { char: "め", romaji: "me" }, { char: "も", romaji: "mo" }] },
  { name: "Y-row", chars: [{ char: "や", romaji: "ya" }, { char: "ゆ", romaji: "yu" }, { char: "よ", romaji: "yo" }] },
  { name: "R-row", chars: [{ char: "ら", romaji: "ra" }, { char: "り", romaji: "ri" }, { char: "る", romaji: "ru" }, { char: "れ", romaji: "re" }, { char: "ろ", romaji: "ro" }] },
  { name: "W-row", chars: [{ char: "わ", romaji: "wa" }, { char: "を", romaji: "wo" }] },
  { name: "N", chars: [{ char: "ん", romaji: "n" }] },
  { name: "G-row", chars: [{ char: "が", romaji: "ga" }, { char: "ぎ", romaji: "gi" }, { char: "ぐ", romaji: "gu" }, { char: "げ", romaji: "ge" }, { char: "ご", romaji: "go" }] },
  { name: "Z-row", chars: [{ char: "ざ", romaji: "za" }, { char: "じ", romaji: "ji" }, { char: "ず", romaji: "zu" }, { char: "ぜ", romaji: "ze" }, { char: "ぞ", romaji: "zo" }] },
  { name: "D-row", chars: [{ char: "だ", romaji: "da" }, { char: "ぢ", romaji: "ji" }, { char: "づ", romaji: "zu" }, { char: "で", romaji: "de" }, { char: "ど", romaji: "do" }] },
  { name: "B-row", chars: [{ char: "ば", romaji: "ba" }, { char: "び", romaji: "bi" }, { char: "ぶ", romaji: "bu" }, { char: "べ", romaji: "be" }, { char: "ぼ", romaji: "bo" }] },
  { name: "P-row", chars: [{ char: "ぱ", romaji: "pa" }, { char: "ぴ", romaji: "pi" }, { char: "ぷ", romaji: "pu" }, { char: "ぺ", romaji: "pe" }, { char: "ぽ", romaji: "po" }] },
];

const KATAKANA_ROWS = [
  { name: "A-row", chars: [{ char: "ア", romaji: "a" }, { char: "イ", romaji: "i" }, { char: "ウ", romaji: "u" }, { char: "エ", romaji: "e" }, { char: "オ", romaji: "o" }] },
  { name: "K-row", chars: [{ char: "カ", romaji: "ka" }, { char: "キ", romaji: "ki" }, { char: "ク", romaji: "ku" }, { char: "ケ", romaji: "ke" }, { char: "コ", romaji: "ko" }] },
  { name: "S-row", chars: [{ char: "サ", romaji: "sa" }, { char: "シ", romaji: "shi" }, { char: "ス", romaji: "su" }, { char: "セ", romaji: "se" }, { char: "ソ", romaji: "so" }] },
  { name: "T-row", chars: [{ char: "タ", romaji: "ta" }, { char: "チ", romaji: "chi" }, { char: "ツ", romaji: "tsu" }, { char: "テ", romaji: "te" }, { char: "ト", romaji: "to" }] },
  { name: "N-row", chars: [{ char: "ナ", romaji: "na" }, { char: "ニ", romaji: "ni" }, { char: "ヌ", romaji: "nu" }, { char: "ネ", romaji: "ne" }, { char: "ノ", romaji: "no" }] },
  { name: "H-row", chars: [{ char: "ハ", romaji: "ha" }, { char: "ヒ", romaji: "hi" }, { char: "フ", romaji: "fu" }, { char: "ヘ", romaji: "he" }, { char: "ホ", romaji: "ho" }] },
  { name: "M-row", chars: [{ char: "マ", romaji: "ma" }, { char: "ミ", romaji: "mi" }, { char: "ム", romaji: "mu" }, { char: "メ", romaji: "me" }, { char: "モ", romaji: "mo" }] },
  { name: "Y-row", chars: [{ char: "ヤ", romaji: "ya" }, { char: "ユ", romaji: "yu" }, { char: "ヨ", romaji: "yo" }] },
  { name: "R-row", chars: [{ char: "ラ", romaji: "ra" }, { char: "リ", romaji: "ri" }, { char: "ル", romaji: "ru" }, { char: "レ", romaji: "re" }, { char: "ロ", romaji: "ro" }] },
  { name: "W-row", chars: [{ char: "ワ", romaji: "wa" }, { char: "ヲ", romaji: "wo" }] },
  { name: "N", chars: [{ char: "ン", romaji: "n" }] },
  { name: "G-row", chars: [{ char: "ガ", romaji: "ga" }, { char: "ギ", romaji: "gi" }, { char: "グ", romaji: "gu" }, { char: "ゲ", romaji: "ge" }, { char: "ゴ", romaji: "go" }] },
  { name: "Z-row", chars: [{ char: "ザ", romaji: "za" }, { char: "ジ", romaji: "ji" }, { char: "ズ", romaji: "zu" }, { char: "ゼ", romaji: "ze" }, { char: "ゾ", romaji: "zo" }] },
  { name: "B-row", chars: [{ char: "バ", romaji: "ba" }, { char: "ビ", romaji: "bi" }, { char: "ブ", romaji: "bu" }, { char: "ベ", romaji: "be" }, { char: "ボ", romaji: "bo" }] },
  { name: "P-row", chars: [{ char: "パ", romaji: "pa" }, { char: "ピ", romaji: "pi" }, { char: "プ", romaji: "pu" }, { char: "ペ", romaji: "pe" }, { char: "ポ", romaji: "po" }] },
];

const WORD_BANK = [
  // Greetings & Phrases
  { japanese: "おはよう", romaji: "ohayou", english: "Good morning (casual)", reading: "hiragana" },
  { japanese: "おはようございます", romaji: "ohayou gozaimasu", english: "Good morning (polite)", reading: "hiragana" },
  { japanese: "こんにちは", romaji: "konnichiwa", english: "Hello / Good afternoon", reading: "hiragana" },
  { japanese: "こんばんは", romaji: "konbanwa", english: "Good evening", reading: "hiragana" },
  { japanese: "さようなら", romaji: "sayounara", english: "Goodbye", reading: "hiragana" },
  { japanese: "またね", romaji: "matane", english: "See you later", reading: "hiragana" },
  { japanese: "じゃあね", romaji: "jaane", english: "Bye (casual)", reading: "hiragana" },
  { japanese: "ありがとう", romaji: "arigatou", english: "Thank you", reading: "hiragana" },
  { japanese: "ありがとうございます", romaji: "arigatou gozaimasu", english: "Thank you (polite)", reading: "hiragana" },
  { japanese: "どういたしまして", romaji: "douitashimashite", english: "You're welcome", reading: "hiragana" },
  { japanese: "すみません", romaji: "sumimasen", english: "Excuse me / Sorry", reading: "hiragana" },
  { japanese: "ごめんなさい", romaji: "gomennasai", english: "I'm sorry", reading: "hiragana" },
  { japanese: "はい", romaji: "hai", english: "Yes", reading: "hiragana" },
  { japanese: "いいえ", romaji: "iie", english: "No", reading: "hiragana" },
  { japanese: "おねがい", romaji: "onegai", english: "Please (request)", reading: "hiragana" },
  { japanese: "どうぞ", romaji: "douzo", english: "Please / Go ahead", reading: "hiragana" },
  { japanese: "わかった", romaji: "wakatta", english: "I understand (casual)", reading: "hiragana" },
  { japanese: "わかりません", romaji: "wakarimasen", english: "I don't understand", reading: "hiragana" },
  { japanese: "いただきます", romaji: "itadakimasu", english: "Let's eat (before meal)", reading: "hiragana" },
  { japanese: "ごちそうさま", romaji: "gochisousama", english: "Thanks for the meal", reading: "hiragana" },
  { japanese: "おやすみ", romaji: "oyasumi", english: "Good night", reading: "hiragana" },
  { japanese: "はじめまして", romaji: "hajimemashite", english: "Nice to meet you", reading: "hiragana" },
  { japanese: "よろしく", romaji: "yoroshiku", english: "Please treat me well", reading: "hiragana" },
  { japanese: "げんき", romaji: "genki", english: "Fine / Energetic", reading: "hiragana" },
  // Numbers
  { japanese: "ぜろ", romaji: "zero", english: "Zero", reading: "hiragana" },
  { japanese: "いち", romaji: "ichi", english: "One", reading: "hiragana" },
  { japanese: "に", romaji: "ni", english: "Two", reading: "hiragana" },
  { japanese: "さん", romaji: "san", english: "Three", reading: "hiragana" },
  { japanese: "し", romaji: "shi", english: "Four", reading: "hiragana" },
  { japanese: "ご", romaji: "go", english: "Five", reading: "hiragana" },
  { japanese: "ろく", romaji: "roku", english: "Six", reading: "hiragana" },
  { japanese: "なな", romaji: "nana", english: "Seven", reading: "hiragana" },
  { japanese: "はち", romaji: "hachi", english: "Eight", reading: "hiragana" },
  { japanese: "きゅう", romaji: "kyuu", english: "Nine", reading: "hiragana" },
  { japanese: "じゅう", romaji: "juu", english: "Ten", reading: "hiragana" },
  { japanese: "ひゃく", romaji: "hyaku", english: "One hundred", reading: "hiragana" },
  { japanese: "せん", romaji: "sen", english: "One thousand", reading: "hiragana" },
  { japanese: "まん", romaji: "man", english: "Ten thousand", reading: "hiragana" },
  // Colors
  { japanese: "あか", romaji: "aka", english: "Red", reading: "hiragana" },
  { japanese: "あお", romaji: "ao", english: "Blue", reading: "hiragana" },
  { japanese: "しろ", romaji: "shiro", english: "White", reading: "hiragana" },
  { japanese: "くろ", romaji: "kuro", english: "Black", reading: "hiragana" },
  { japanese: "きいろ", romaji: "kiiro", english: "Yellow", reading: "hiragana" },
  { japanese: "みどり", romaji: "midori", english: "Green", reading: "hiragana" },
  { japanese: "むらさき", romaji: "murasaki", english: "Purple", reading: "hiragana" },
  { japanese: "ちゃいろ", romaji: "chairo", english: "Brown", reading: "hiragana" },
  { japanese: "はいいろ", romaji: "haiiro", english: "Gray", reading: "hiragana" },
  { japanese: "きんいろ", romaji: "kin'iro", english: "Gold", reading: "hiragana" },
  { japanese: "ピンク", romaji: "pinku", english: "Pink", reading: "katakana" },
  { japanese: "オレンジ", romaji: "orenji", english: "Orange", reading: "katakana" },
  // Body Parts
  { japanese: "あたま", romaji: "atama", english: "Head", reading: "hiragana" },
  { japanese: "かお", romaji: "kao", english: "Face", reading: "hiragana" },
  { japanese: "め", romaji: "me", english: "Eye", reading: "hiragana" },
  { japanese: "みみ", romaji: "mimi", english: "Ear", reading: "hiragana" },
  { japanese: "はな", romaji: "hana", english: "Nose", reading: "hiragana" },
  { japanese: "くち", romaji: "kuchi", english: "Mouth", reading: "hiragana" },
  { japanese: "は", romaji: "ha", english: "Tooth / Teeth", reading: "hiragana" },
  { japanese: "て", romaji: "te", english: "Hand", reading: "hiragana" },
  { japanese: "ゆび", romaji: "yubi", english: "Finger", reading: "hiragana" },
  { japanese: "うで", romaji: "ude", english: "Arm", reading: "hiragana" },
  { japanese: "かた", romaji: "kata", english: "Shoulder", reading: "hiragana" },
  { japanese: "むね", romaji: "mune", english: "Chest", reading: "hiragana" },
  { japanese: "おなか", romaji: "onaka", english: "Stomach / Belly", reading: "hiragana" },
  { japanese: "せなか", romaji: "senaka", english: "Back (body)", reading: "hiragana" },
  { japanese: "あし", romaji: "ashi", english: "Leg / Foot", reading: "hiragana" },
  { japanese: "ひざ", romaji: "hiza", english: "Knee", reading: "hiragana" },
  { japanese: "からだ", romaji: "karada", english: "Body", reading: "hiragana" },
  { japanese: "こころ", romaji: "kokoro", english: "Heart / Mind", reading: "hiragana" },
  // Food & Drink
  { japanese: "みず", romaji: "mizu", english: "Water", reading: "hiragana" },
  { japanese: "おちゃ", romaji: "ocha", english: "Tea", reading: "hiragana" },
  { japanese: "みそしる", romaji: "misoshiru", english: "Miso soup", reading: "hiragana" },
  { japanese: "ごはん", romaji: "gohan", english: "Rice / Meal", reading: "hiragana" },
  { japanese: "にく", romaji: "niku", english: "Meat", reading: "hiragana" },
  { japanese: "さかな", romaji: "sakana", english: "Fish", reading: "hiragana" },
  { japanese: "たまご", romaji: "tamago", english: "Egg", reading: "hiragana" },
  { japanese: "やさい", romaji: "yasai", english: "Vegetables", reading: "hiragana" },
  { japanese: "くだもの", romaji: "kudamono", english: "Fruit", reading: "hiragana" },
  { japanese: "すし", romaji: "sushi", english: "Sushi", reading: "hiragana" },
  { japanese: "てんぷら", romaji: "tenpura", english: "Tempura", reading: "hiragana" },
  { japanese: "うどん", romaji: "udon", english: "Udon noodles", reading: "hiragana" },
  { japanese: "そば", romaji: "soba", english: "Soba noodles", reading: "hiragana" },
  { japanese: "とうふ", romaji: "toufu", english: "Tofu", reading: "hiragana" },
  { japanese: "のり", romaji: "nori", english: "Seaweed", reading: "hiragana" },
  { japanese: "しお", romaji: "shio", english: "Salt", reading: "hiragana" },
  { japanese: "さとう", romaji: "satou", english: "Sugar", reading: "hiragana" },
  { japanese: "しょうゆ", romaji: "shouyu", english: "Soy sauce", reading: "hiragana" },
  { japanese: "パン", romaji: "pan", english: "Bread", reading: "katakana" },
  { japanese: "ラーメン", romaji: "raamen", english: "Ramen", reading: "katakana" },
  { japanese: "コーヒー", romaji: "koohii", english: "Coffee", reading: "katakana" },
  { japanese: "ビール", romaji: "biiru", english: "Beer", reading: "katakana" },
  { japanese: "ケーキ", romaji: "keeki", english: "Cake", reading: "katakana" },
  { japanese: "アイスクリーム", romaji: "aisukuriimu", english: "Ice cream", reading: "katakana" },
  { japanese: "ジュース", romaji: "juusu", english: "Juice", reading: "katakana" },
  { japanese: "ミルク", romaji: "miruku", english: "Milk", reading: "katakana" },
  { japanese: "チョコレート", romaji: "chokoreeto", english: "Chocolate", reading: "katakana" },
  { japanese: "バター", romaji: "bataa", english: "Butter", reading: "katakana" },
  { japanese: "サラダ", romaji: "sarada", english: "Salad", reading: "katakana" },
  { japanese: "スープ", romaji: "suupu", english: "Soup", reading: "katakana" },
  { japanese: "ピザ", romaji: "piza", english: "Pizza", reading: "katakana" },
  { japanese: "ハンバーガー", romaji: "hanbaagaa", english: "Hamburger", reading: "katakana" },
  // Animals
  { japanese: "いぬ", romaji: "inu", english: "Dog", reading: "hiragana" },
  { japanese: "ねこ", romaji: "neko", english: "Cat", reading: "hiragana" },
  { japanese: "とり", romaji: "tori", english: "Bird", reading: "hiragana" },
  { japanese: "うま", romaji: "uma", english: "Horse", reading: "hiragana" },
  { japanese: "うし", romaji: "ushi", english: "Cow", reading: "hiragana" },
  { japanese: "ぶた", romaji: "buta", english: "Pig", reading: "hiragana" },
  { japanese: "くま", romaji: "kuma", english: "Bear", reading: "hiragana" },
  { japanese: "うさぎ", romaji: "usagi", english: "Rabbit", reading: "hiragana" },
  { japanese: "へび", romaji: "hebi", english: "Snake", reading: "hiragana" },
  { japanese: "かめ", romaji: "kame", english: "Turtle", reading: "hiragana" },
  { japanese: "さる", romaji: "saru", english: "Monkey", reading: "hiragana" },
  { japanese: "きつね", romaji: "kitsune", english: "Fox", reading: "hiragana" },
  { japanese: "おおかみ", romaji: "ookami", english: "Wolf", reading: "hiragana" },
  { japanese: "さめ", romaji: "same", english: "Shark", reading: "hiragana" },
  { japanese: "くじら", romaji: "kujira", english: "Whale", reading: "hiragana" },
  { japanese: "かえる", romaji: "kaeru", english: "Frog", reading: "hiragana" },
  { japanese: "むし", romaji: "mushi", english: "Insect / Bug", reading: "hiragana" },
  { japanese: "ライオン", romaji: "raion", english: "Lion", reading: "katakana" },
  { japanese: "トラ", romaji: "tora", english: "Tiger", reading: "katakana" },
  { japanese: "ゾウ", romaji: "zou", english: "Elephant", reading: "katakana" },
  { japanese: "キリン", romaji: "kirin", english: "Giraffe", reading: "katakana" },
  { japanese: "パンダ", romaji: "panda", english: "Panda", reading: "katakana" },
  { japanese: "ペンギン", romaji: "pengin", english: "Penguin", reading: "katakana" },
  { japanese: "コアラ", romaji: "koara", english: "Koala", reading: "katakana" },
  // Nature
  { japanese: "そら", romaji: "sora", english: "Sky", reading: "hiragana" },
  { japanese: "うみ", romaji: "umi", english: "Sea / Ocean", reading: "hiragana" },
  { japanese: "やま", romaji: "yama", english: "Mountain", reading: "hiragana" },
  { japanese: "かわ", romaji: "kawa", english: "River", reading: "hiragana" },
  { japanese: "もり", romaji: "mori", english: "Forest", reading: "hiragana" },
  { japanese: "しま", romaji: "shima", english: "Island", reading: "hiragana" },
  { japanese: "はな", romaji: "hana", english: "Flower", reading: "hiragana" },
  { japanese: "き", romaji: "ki", english: "Tree", reading: "hiragana" },
  { japanese: "くさ", romaji: "kusa", english: "Grass", reading: "hiragana" },
  { japanese: "いし", romaji: "ishi", english: "Stone / Rock", reading: "hiragana" },
  { japanese: "つき", romaji: "tsuki", english: "Moon", reading: "hiragana" },
  { japanese: "ほし", romaji: "hoshi", english: "Star", reading: "hiragana" },
  { japanese: "たいよう", romaji: "taiyou", english: "Sun", reading: "hiragana" },
  { japanese: "かぜ", romaji: "kaze", english: "Wind", reading: "hiragana" },
  { japanese: "あめ", romaji: "ame", english: "Rain", reading: "hiragana" },
  { japanese: "ゆき", romaji: "yuki", english: "Snow", reading: "hiragana" },
  { japanese: "くも", romaji: "kumo", english: "Cloud", reading: "hiragana" },
  { japanese: "かみなり", romaji: "kaminari", english: "Thunder", reading: "hiragana" },
  { japanese: "にじ", romaji: "niji", english: "Rainbow", reading: "hiragana" },
  { japanese: "さくら", romaji: "sakura", english: "Cherry blossom", reading: "hiragana" },
  // Family
  { japanese: "ちち", romaji: "chichi", english: "Father (my)", reading: "hiragana" },
  { japanese: "はは", romaji: "haha", english: "Mother (my)", reading: "hiragana" },
  { japanese: "おとうさん", romaji: "otousan", english: "Father (someone's)", reading: "hiragana" },
  { japanese: "おかあさん", romaji: "okaasan", english: "Mother (someone's)", reading: "hiragana" },
  { japanese: "あに", romaji: "ani", english: "Older brother (my)", reading: "hiragana" },
  { japanese: "あね", romaji: "ane", english: "Older sister (my)", reading: "hiragana" },
  { japanese: "おとうと", romaji: "otouto", english: "Younger brother", reading: "hiragana" },
  { japanese: "いもうと", romaji: "imouto", english: "Younger sister", reading: "hiragana" },
  { japanese: "そふ", romaji: "sofu", english: "Grandfather (my)", reading: "hiragana" },
  { japanese: "そぼ", romaji: "sobo", english: "Grandmother (my)", reading: "hiragana" },
  { japanese: "こども", romaji: "kodomo", english: "Child", reading: "hiragana" },
  { japanese: "かぞく", romaji: "kazoku", english: "Family", reading: "hiragana" },
  { japanese: "おっと", romaji: "otto", english: "Husband (my)", reading: "hiragana" },
  { japanese: "つま", romaji: "tsuma", english: "Wife (my)", reading: "hiragana" },
  // Places
  { japanese: "まち", romaji: "machi", english: "Town", reading: "hiragana" },
  { japanese: "みせ", romaji: "mise", english: "Shop / Store", reading: "hiragana" },
  { japanese: "がっこう", romaji: "gakkou", english: "School", reading: "hiragana" },
  { japanese: "びょういん", romaji: "byouin", english: "Hospital", reading: "hiragana" },
  { japanese: "えき", romaji: "eki", english: "Station", reading: "hiragana" },
  { japanese: "ほんや", romaji: "honya", english: "Bookstore", reading: "hiragana" },
  { japanese: "こうえん", romaji: "kouen", english: "Park", reading: "hiragana" },
  { japanese: "としょかん", romaji: "toshokan", english: "Library", reading: "hiragana" },
  { japanese: "ぎんこう", romaji: "ginkou", english: "Bank", reading: "hiragana" },
  { japanese: "くうこう", romaji: "kuukou", english: "Airport", reading: "hiragana" },
  { japanese: "うみべ", romaji: "umibe", english: "Beach / Seaside", reading: "hiragana" },
  { japanese: "レストラン", romaji: "resutoran", english: "Restaurant", reading: "katakana" },
  { japanese: "ホテル", romaji: "hoteru", english: "Hotel", reading: "katakana" },
  { japanese: "スーパー", romaji: "suupaa", english: "Supermarket", reading: "katakana" },
  { japanese: "デパート", romaji: "depaato", english: "Department store", reading: "katakana" },
  { japanese: "コンビニ", romaji: "konbini", english: "Convenience store", reading: "katakana" },
  // Time
  { japanese: "いま", romaji: "ima", english: "Now", reading: "hiragana" },
  { japanese: "きょう", romaji: "kyou", english: "Today", reading: "hiragana" },
  { japanese: "あした", romaji: "ashita", english: "Tomorrow", reading: "hiragana" },
  { japanese: "きのう", romaji: "kinou", english: "Yesterday", reading: "hiragana" },
  { japanese: "あさって", romaji: "asatte", english: "Day after tomorrow", reading: "hiragana" },
  { japanese: "あさ", romaji: "asa", english: "Morning", reading: "hiragana" },
  { japanese: "ひる", romaji: "hiru", english: "Noon / Daytime", reading: "hiragana" },
  { japanese: "よる", romaji: "yoru", english: "Night", reading: "hiragana" },
  { japanese: "まいにち", romaji: "mainichi", english: "Every day", reading: "hiragana" },
  { japanese: "こんしゅう", romaji: "konshuu", english: "This week", reading: "hiragana" },
  { japanese: "らいしゅう", romaji: "raishuu", english: "Next week", reading: "hiragana" },
  { japanese: "ことし", romaji: "kotoshi", english: "This year", reading: "hiragana" },
  { japanese: "らいねん", romaji: "rainen", english: "Next year", reading: "hiragana" },
  { japanese: "じかん", romaji: "jikan", english: "Time / Hour", reading: "hiragana" },
  { japanese: "ふん", romaji: "fun", english: "Minute", reading: "hiragana" },
  { japanese: "にちようび", romaji: "nichiyoubi", english: "Sunday", reading: "hiragana" },
  { japanese: "げつようび", romaji: "getsuyoubi", english: "Monday", reading: "hiragana" },
  { japanese: "かようび", romaji: "kayoubi", english: "Tuesday", reading: "hiragana" },
  { japanese: "すいようび", romaji: "suiyoubi", english: "Wednesday", reading: "hiragana" },
  { japanese: "もくようび", romaji: "mokuyoubi", english: "Thursday", reading: "hiragana" },
  { japanese: "きんようび", romaji: "kin'youbi", english: "Friday", reading: "hiragana" },
  { japanese: "どようび", romaji: "doyoubi", english: "Saturday", reading: "hiragana" },
  // Adjectives
  { japanese: "おおきい", romaji: "ookii", english: "Big / Large", reading: "hiragana" },
  { japanese: "ちいさい", romaji: "chiisai", english: "Small / Little", reading: "hiragana" },
  { japanese: "たかい", romaji: "takai", english: "Tall / Expensive", reading: "hiragana" },
  { japanese: "ひくい", romaji: "hikui", english: "Short (height)", reading: "hiragana" },
  { japanese: "やすい", romaji: "yasui", english: "Cheap", reading: "hiragana" },
  { japanese: "はやい", romaji: "hayai", english: "Fast / Early", reading: "hiragana" },
  { japanese: "おそい", romaji: "osoi", english: "Slow / Late", reading: "hiragana" },
  { japanese: "あたらしい", romaji: "atarashii", english: "New", reading: "hiragana" },
  { japanese: "ふるい", romaji: "furui", english: "Old (things)", reading: "hiragana" },
  { japanese: "いい", romaji: "ii", english: "Good", reading: "hiragana" },
  { japanese: "わるい", romaji: "warui", english: "Bad", reading: "hiragana" },
  { japanese: "あつい", romaji: "atsui", english: "Hot", reading: "hiragana" },
  { japanese: "さむい", romaji: "samui", english: "Cold (weather)", reading: "hiragana" },
  { japanese: "つめたい", romaji: "tsumetai", english: "Cold (to touch)", reading: "hiragana" },
  { japanese: "あたたかい", romaji: "atatakai", english: "Warm", reading: "hiragana" },
  { japanese: "たのしい", romaji: "tanoshii", english: "Fun / Enjoyable", reading: "hiragana" },
  { japanese: "かなしい", romaji: "kanashii", english: "Sad", reading: "hiragana" },
  { japanese: "うれしい", romaji: "ureshii", english: "Happy / Glad", reading: "hiragana" },
  { japanese: "こわい", romaji: "kowai", english: "Scary / Afraid", reading: "hiragana" },
  { japanese: "おもしろい", romaji: "omoshiroi", english: "Interesting / Funny", reading: "hiragana" },
  { japanese: "つまらない", romaji: "tsumaranai", english: "Boring", reading: "hiragana" },
  { japanese: "むずかしい", romaji: "muzukashii", english: "Difficult", reading: "hiragana" },
  { japanese: "やさしい", romaji: "yasashii", english: "Easy / Kind", reading: "hiragana" },
  { japanese: "きれい", romaji: "kirei", english: "Beautiful / Clean", reading: "hiragana" },
  { japanese: "かわいい", romaji: "kawaii", english: "Cute", reading: "hiragana" },
  { japanese: "かっこいい", romaji: "kakkoii", english: "Cool / Handsome", reading: "hiragana" },
  { japanese: "いそがしい", romaji: "isogashii", english: "Busy", reading: "hiragana" },
  { japanese: "じょうず", romaji: "jouzu", english: "Skillful / Good at", reading: "hiragana" },
  { japanese: "へた", romaji: "heta", english: "Unskillful / Bad at", reading: "hiragana" },
  { japanese: "ながい", romaji: "nagai", english: "Long", reading: "hiragana" },
  { japanese: "みじかい", romaji: "mijikai", english: "Short (length)", reading: "hiragana" },
  { japanese: "ひろい", romaji: "hiroi", english: "Wide / Spacious", reading: "hiragana" },
  { japanese: "せまい", romaji: "semai", english: "Narrow / Small space", reading: "hiragana" },
  { japanese: "おいしい", romaji: "oishii", english: "Delicious", reading: "hiragana" },
  { japanese: "まずい", romaji: "mazui", english: "Tastes bad", reading: "hiragana" },
  { japanese: "からい", romaji: "karai", english: "Spicy", reading: "hiragana" },
  { japanese: "あまい", romaji: "amai", english: "Sweet", reading: "hiragana" },
  { japanese: "しょっぱい", romaji: "shoppai", english: "Salty", reading: "hiragana" },
  // Verbs
  { japanese: "たべる", romaji: "taberu", english: "To eat", reading: "hiragana" },
  { japanese: "のむ", romaji: "nomu", english: "To drink", reading: "hiragana" },
  { japanese: "みる", romaji: "miru", english: "To see / watch", reading: "hiragana" },
  { japanese: "きく", romaji: "kiku", english: "To listen / ask", reading: "hiragana" },
  { japanese: "はなす", romaji: "hanasu", english: "To speak / talk", reading: "hiragana" },
  { japanese: "よむ", romaji: "yomu", english: "To read", reading: "hiragana" },
  { japanese: "かく", romaji: "kaku", english: "To write / draw", reading: "hiragana" },
  { japanese: "いく", romaji: "iku", english: "To go", reading: "hiragana" },
  { japanese: "くる", romaji: "kuru", english: "To come", reading: "hiragana" },
  { japanese: "かえる", romaji: "kaeru", english: "To return home", reading: "hiragana" },
  { japanese: "ねる", romaji: "neru", english: "To sleep", reading: "hiragana" },
  { japanese: "おきる", romaji: "okiru", english: "To wake up", reading: "hiragana" },
  { japanese: "かう", romaji: "kau", english: "To buy", reading: "hiragana" },
  { japanese: "うる", romaji: "uru", english: "To sell", reading: "hiragana" },
  { japanese: "あそぶ", romaji: "asobu", english: "To play", reading: "hiragana" },
  { japanese: "まつ", romaji: "matsu", english: "To wait", reading: "hiragana" },
  { japanese: "おぼえる", romaji: "oboeru", english: "To remember", reading: "hiragana" },
  { japanese: "わすれる", romaji: "wasureru", english: "To forget", reading: "hiragana" },
  { japanese: "おしえる", romaji: "oshieru", english: "To teach", reading: "hiragana" },
  { japanese: "ならう", romaji: "narau", english: "To learn", reading: "hiragana" },
  { japanese: "つかう", romaji: "tsukau", english: "To use", reading: "hiragana" },
  { japanese: "つくる", romaji: "tsukuru", english: "To make / create", reading: "hiragana" },
  { japanese: "はしる", romaji: "hashiru", english: "To run", reading: "hiragana" },
  { japanese: "あるく", romaji: "aruku", english: "To walk", reading: "hiragana" },
  { japanese: "とぶ", romaji: "tobu", english: "To fly / jump", reading: "hiragana" },
  { japanese: "およぐ", romaji: "oyogu", english: "To swim", reading: "hiragana" },
  { japanese: "うたう", romaji: "utau", english: "To sing", reading: "hiragana" },
  { japanese: "おどる", romaji: "odoru", english: "To dance", reading: "hiragana" },
  { japanese: "あける", romaji: "akeru", english: "To open", reading: "hiragana" },
  { japanese: "しめる", romaji: "shimeru", english: "To close", reading: "hiragana" },
  { japanese: "すわる", romaji: "suwaru", english: "To sit", reading: "hiragana" },
  { japanese: "たつ", romaji: "tatsu", english: "To stand", reading: "hiragana" },
  { japanese: "もつ", romaji: "motsu", english: "To hold / carry", reading: "hiragana" },
  { japanese: "おく", romaji: "oku", english: "To put / place", reading: "hiragana" },
  { japanese: "みせる", romaji: "miseru", english: "To show", reading: "hiragana" },
  { japanese: "もらう", romaji: "morau", english: "To receive", reading: "hiragana" },
  { japanese: "あげる", romaji: "ageru", english: "To give", reading: "hiragana" },
  { japanese: "かす", romaji: "kasu", english: "To lend", reading: "hiragana" },
  { japanese: "かりる", romaji: "kariru", english: "To borrow", reading: "hiragana" },
  { japanese: "でかける", romaji: "dekakeru", english: "To go out", reading: "hiragana" },
  { japanese: "はいる", romaji: "hairu", english: "To enter", reading: "hiragana" },
  { japanese: "でる", romaji: "deru", english: "To exit / leave", reading: "hiragana" },
  { japanese: "おわる", romaji: "owaru", english: "To end / finish", reading: "hiragana" },
  { japanese: "はじまる", romaji: "hajimaru", english: "To begin / start", reading: "hiragana" },
  // Pronouns & People
  { japanese: "わたし", romaji: "watashi", english: "I / Me", reading: "hiragana" },
  { japanese: "ぼく", romaji: "boku", english: "I / Me (male casual)", reading: "hiragana" },
  { japanese: "あなた", romaji: "anata", english: "You", reading: "hiragana" },
  { japanese: "かれ", romaji: "kare", english: "He / Boyfriend", reading: "hiragana" },
  { japanese: "かのじょ", romaji: "kanojo", english: "She / Girlfriend", reading: "hiragana" },
  { japanese: "みんな", romaji: "minna", english: "Everyone", reading: "hiragana" },
  { japanese: "ひと", romaji: "hito", english: "Person / People", reading: "hiragana" },
  { japanese: "ともだち", romaji: "tomodachi", english: "Friend", reading: "hiragana" },
  { japanese: "せんせい", romaji: "sensei", english: "Teacher", reading: "hiragana" },
  { japanese: "がくせい", romaji: "gakusei", english: "Student", reading: "hiragana" },
  { japanese: "いしゃ", romaji: "isha", english: "Doctor", reading: "hiragana" },
  { japanese: "りょうしん", romaji: "ryoushin", english: "Parents", reading: "hiragana" },
  // Clothing
  { japanese: "ふく", romaji: "fuku", english: "Clothes", reading: "hiragana" },
  { japanese: "くつ", romaji: "kutsu", english: "Shoes", reading: "hiragana" },
  { japanese: "くつした", romaji: "kutsushita", english: "Socks", reading: "hiragana" },
  { japanese: "ぼうし", romaji: "boushi", english: "Hat", reading: "hiragana" },
  { japanese: "めがね", romaji: "megane", english: "Glasses", reading: "hiragana" },
  { japanese: "かばん", romaji: "kaban", english: "Bag", reading: "hiragana" },
  { japanese: "シャツ", romaji: "shatsu", english: "Shirt", reading: "katakana" },
  { japanese: "ズボン", romaji: "zubon", english: "Pants / Trousers", reading: "katakana" },
  { japanese: "スカート", romaji: "sukaato", english: "Skirt", reading: "katakana" },
  { japanese: "コート", romaji: "kooto", english: "Coat", reading: "katakana" },
  { japanese: "ジャケット", romaji: "jaketto", english: "Jacket", reading: "katakana" },
  // Directions
  { japanese: "みぎ", romaji: "migi", english: "Right", reading: "hiragana" },
  { japanese: "ひだり", romaji: "hidari", english: "Left", reading: "hiragana" },
  { japanese: "まえ", romaji: "mae", english: "Front / Before", reading: "hiragana" },
  { japanese: "うしろ", romaji: "ushiro", english: "Behind / Back", reading: "hiragana" },
  { japanese: "うえ", romaji: "ue", english: "Above / Up", reading: "hiragana" },
  { japanese: "した", romaji: "shita", english: "Below / Down", reading: "hiragana" },
  { japanese: "なか", romaji: "naka", english: "Inside / Middle", reading: "hiragana" },
  { japanese: "そと", romaji: "soto", english: "Outside", reading: "hiragana" },
  { japanese: "ちかく", romaji: "chikaku", english: "Nearby / Close", reading: "hiragana" },
  { japanese: "とおく", romaji: "tooku", english: "Far away", reading: "hiragana" },
  { japanese: "まっすぐ", romaji: "massugu", english: "Straight ahead", reading: "hiragana" },
  // Common Objects
  { japanese: "ほん", romaji: "hon", english: "Book", reading: "hiragana" },
  { japanese: "かみ", romaji: "kami", english: "Paper", reading: "hiragana" },
  { japanese: "えんぴつ", romaji: "enpitsu", english: "Pencil", reading: "hiragana" },
  { japanese: "つくえ", romaji: "tsukue", english: "Desk", reading: "hiragana" },
  { japanese: "いす", romaji: "isu", english: "Chair", reading: "hiragana" },
  { japanese: "まど", romaji: "mado", english: "Window", reading: "hiragana" },
  { japanese: "でんわ", romaji: "denwa", english: "Telephone", reading: "hiragana" },
  { japanese: "かぎ", romaji: "kagi", english: "Key", reading: "hiragana" },
  { japanese: "おかね", romaji: "okane", english: "Money", reading: "hiragana" },
  { japanese: "じしょ", romaji: "jisho", english: "Dictionary", reading: "hiragana" },
  { japanese: "ドア", romaji: "doa", english: "Door", reading: "katakana" },
  { japanese: "テレビ", romaji: "terebi", english: "Television", reading: "katakana" },
  { japanese: "カメラ", romaji: "kamera", english: "Camera", reading: "katakana" },
  { japanese: "スマホ", romaji: "sumaho", english: "Smartphone", reading: "katakana" },
  { japanese: "コンピューター", romaji: "konpyuutaa", english: "Computer", reading: "katakana" },
  { japanese: "ベッド", romaji: "beddo", english: "Bed", reading: "katakana" },
  { japanese: "テーブル", romaji: "teeburu", english: "Table", reading: "katakana" },
  { japanese: "ソファ", romaji: "sofa", english: "Sofa", reading: "katakana" },
  // Transport
  { japanese: "でんしゃ", romaji: "densha", english: "Train", reading: "hiragana" },
  { japanese: "くるま", romaji: "kuruma", english: "Car", reading: "hiragana" },
  { japanese: "じてんしゃ", romaji: "jitensha", english: "Bicycle", reading: "hiragana" },
  { japanese: "ふね", romaji: "fune", english: "Ship / Boat", reading: "hiragana" },
  { japanese: "ひこうき", romaji: "hikouki", english: "Airplane", reading: "hiragana" },
  { japanese: "バス", romaji: "basu", english: "Bus", reading: "katakana" },
  { japanese: "タクシー", romaji: "takushii", english: "Taxi", reading: "katakana" },
  // Misc / Culture
  { japanese: "なまえ", romaji: "namae", english: "Name", reading: "hiragana" },
  { japanese: "ことば", romaji: "kotoba", english: "Word / Language", reading: "hiragana" },
  { japanese: "にほんご", romaji: "nihongo", english: "Japanese language", reading: "hiragana" },
  { japanese: "えいご", romaji: "eigo", english: "English language", reading: "hiragana" },
  { japanese: "しごと", romaji: "shigoto", english: "Work / Job", reading: "hiragana" },
  { japanese: "やすみ", romaji: "yasumi", english: "Rest / Holiday", reading: "hiragana" },
  { japanese: "しつもん", romaji: "shitsumon", english: "Question", reading: "hiragana" },
  { japanese: "こたえ", romaji: "kotae", english: "Answer", reading: "hiragana" },
  { japanese: "うた", romaji: "uta", english: "Song", reading: "hiragana" },
  { japanese: "えいが", romaji: "eiga", english: "Movie", reading: "hiragana" },
  { japanese: "りょこう", romaji: "ryokou", english: "Travel", reading: "hiragana" },
  { japanese: "ゆめ", romaji: "yume", english: "Dream", reading: "hiragana" },
  { japanese: "あい", romaji: "ai", english: "Love", reading: "hiragana" },
  { japanese: "へいわ", romaji: "heiwa", english: "Peace", reading: "hiragana" },
  { japanese: "にほん", romaji: "nihon", english: "Japan", reading: "hiragana" },
  { japanese: "とうきょう", romaji: "toukyou", english: "Tokyo", reading: "hiragana" },
  { japanese: "おおさか", romaji: "oosaka", english: "Osaka", reading: "hiragana" },
  { japanese: "くに", romaji: "kuni", english: "Country", reading: "hiragana" },
  { japanese: "こえ", romaji: "koe", english: "Voice", reading: "hiragana" },
  { japanese: "いろ", romaji: "iro", english: "Color", reading: "hiragana" },
  { japanese: "かたち", romaji: "katachi", english: "Shape / Form", reading: "hiragana" },
  { japanese: "アニメ", romaji: "anime", english: "Anime", reading: "katakana" },
  { japanese: "マンガ", romaji: "manga", english: "Manga", reading: "katakana" },
  { japanese: "ゲーム", romaji: "geemu", english: "Game", reading: "katakana" },
  { japanese: "スポーツ", romaji: "supootsu", english: "Sports", reading: "katakana" },
  { japanese: "サッカー", romaji: "sakkaa", english: "Soccer", reading: "katakana" },
  { japanese: "テニス", romaji: "tenisu", english: "Tennis", reading: "katakana" },
  { japanese: "ミュージック", romaji: "myuujikku", english: "Music", reading: "katakana" },
  { japanese: "ピアノ", romaji: "piano", english: "Piano", reading: "katakana" },
  { japanese: "ギター", romaji: "gitaa", english: "Guitar", reading: "katakana" },
  { japanese: "サムライ", romaji: "samurai", english: "Samurai", reading: "katakana" },
  { japanese: "ニンジャ", romaji: "ninja", english: "Ninja", reading: "katakana" },
  { japanese: "トイレ", romaji: "toire", english: "Toilet / Restroom", reading: "katakana" },
  { japanese: "アパート", romaji: "apaato", english: "Apartment", reading: "katakana" },
  { japanese: "インターネット", romaji: "intaanetto", english: "Internet", reading: "katakana" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Keiro wordmark (text, gradient) ──
const RALogo = () => (
  <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.02 }}>
    <span style={{
      fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: "28px", letterSpacing: "-0.03em",
      background: "linear-gradient(120deg, var(--coral), var(--accent))",
      WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
    }}>{BRAND.name}</span>
    <span style={{
      fontFamily: "'Noto Sans JP', sans-serif", fontSize: "11px", fontWeight: 700,
      color: "var(--muted)", letterSpacing: "0.36em", marginTop: "2px",
    }}>{BRAND.kana}</span>
  </div>
);

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+JP:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:    #ffffff;
    --cream2:   #ece8ff;
    --paper:    #f4f1fd;
    --charcoal: #1a1430;
    --dark:     #2a2150;
    --coral:    #ff4d6d;
    --coral-d:  #e02f55;
    --coral-l:  #ffd3dd;
    --accent:   #6c4cf0;
    --accent-d: #5a3ad6;
    --muted:    #6e6890;
    --border:   rgba(26,20,48,0.12);
    --correct:  #12b886;
    --wrong:    #ff4242;
  }

  body { font-family: 'Nunito', sans-serif; background: var(--paper); color: var(--charcoal); min-height: 100vh; }

  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: var(--paper); padding-bottom: env(safe-area-inset-bottom); }

  /* HEADER */
  .header {
    background: var(--cream); border-bottom: 2.5px solid var(--cream2);
    padding: calc(env(safe-area-inset-top) + 10px) 16px 10px; display: flex; align-items: center; gap: 12px; z-index: 10;
  }
  .header-right { flex: 1; min-width: 0; }
  .header-course { font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: var(--muted); text-transform: uppercase; }
  .header-tagline { font-size: 12px; font-weight: 700; color: var(--coral); margin-top: 1px; }
  .back-btn {
    background: var(--cream2); border: none; width: 32px; height: 32px; border-radius: 50%;
    font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; color: var(--charcoal); transition: background 0.18s;
  }
  .back-btn:hover { background: var(--coral-l); }

  /* NAV */
  .nav-tabs { display: flex; background: var(--cream); border-bottom: 2.5px solid var(--cream2); }
  .nav-tab {
    flex: 1; padding: 10px 6px; border: none; background: none;
    font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800;
    color: var(--muted); cursor: pointer; border-bottom: 3px solid transparent;
    margin-bottom: -2.5px; transition: all 0.18s;
  }
  .nav-tab.active { color: var(--charcoal); border-bottom-color: var(--coral); }

  /* HOME */
  .home-screen { flex: 1; overflow-y: auto; }
  .hero {
    background: linear-gradient(135deg, #fff0f5 0%, #efe9ff 100%); padding: 18px 20px 0;
    display: flex; align-items: flex-end; gap: 10px;
    position: relative; overflow: hidden; min-height: 148px;
    border-bottom: 2.5px solid var(--cream2);
  }
  .hero-text { flex: 1; padding-bottom: 18px; position: relative; z-index: 2; }
  .hero-welcome { font-size: 10px; font-weight: 900; letter-spacing: 0.12em; color: var(--muted); text-transform: uppercase; }
  .hero-title { font-size: 28px; font-weight: 900; color: var(--charcoal); line-height: 1.05; margin-top: 3px; }
  .hero-title em { color: var(--coral); font-style: normal; }
  .hero-bg { position: absolute; bottom: -8px; right: 70px; font-family: 'Noto Sans JP',sans-serif; font-size: 108px; color: rgba(108,76,240,0.10); line-height: 1; pointer-events: none; }

  /* Discord */
  .discord-banner {
    margin: 12px 14px 0; background: #5865F2; border-radius: 14px;
    padding: 11px 14px; display: flex; align-items: center; gap: 11px;
    text-decoration: none; color: white; box-shadow: 0 3px 12px rgba(88,101,242,0.28);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .discord-banner:hover { transform: translateY(-2px); box-shadow: 0 5px 18px rgba(88,101,242,0.38); }
  .discord-text strong { display: block; font-size: 13px; font-weight: 800; }
  .discord-text span { font-size: 11px; opacity: 0.85; font-weight: 600; }
  .discord-arrow { margin-left: auto; font-size: 15px; opacity: 0.7; }

  .settings-content { padding: 12px 14px 26px; display: flex; flex-direction: column; gap: 12px; }
  .section-label { font-size: 12px; font-weight: 900; color: var(--charcoal); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 7px; }
  .card { background: var(--cream); border-radius: 14px; padding: 13px; border: 2px solid var(--cream2); }

  .mode-selector { display: flex; gap: 9px; }
  .mode-btn { flex: 1; padding: 13px 8px; border: 2px solid var(--cream2); border-radius: 13px; background: white; cursor: pointer; text-align: center; transition: all 0.18s; }
  .mode-btn:hover { border-color: var(--coral-l); }
  .mode-btn.active { border-color: var(--coral); background: #f3eeff; }
  .mode-btn-icon { font-size: 26px; display: block; font-family: 'Noto Sans JP', sans-serif; }
  .mode-btn-label { font-size: 13px; font-weight: 900; color: var(--charcoal); margin-top: 4px; display: block; }
  .mode-btn-sub { font-size: 10px; color: var(--muted); font-weight: 700; }
  .mode-btn.active .mode-btn-label { color: var(--coral-d); }

  .script-selector { display: flex; gap: 8px; }
  .script-btn { flex: 1; padding: 11px 6px; border: 2px solid var(--cream2); border-radius: 11px; background: white; cursor: pointer; text-align: center; transition: all 0.18s; }
  .script-btn:hover { border-color: var(--coral-l); }
  .script-btn.active { border-color: var(--coral); background: #f3eeff; }
  .script-char { font-family: 'Noto Sans JP', sans-serif; font-size: 25px; display: block; line-height: 1.2; }
  .script-label { font-size: 10px; font-weight: 900; color: var(--muted); margin-top: 2px; letter-spacing: 0.05em; display: block; }
  .script-btn.active .script-label { color: var(--coral-d); }

  .row-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .row-btn { padding: 8px 4px; border: 2px solid var(--cream2); border-radius: 9px; background: white; cursor: pointer; text-align: center; font-family: 'Nunito', sans-serif; font-size: 11px; font-weight: 800; color: var(--muted); transition: all 0.15s; }
  .row-btn:hover:not(:disabled) { border-color: var(--coral-l); color: var(--charcoal); }
  .row-btn.active { border-color: var(--coral); background: #f3eeff; color: var(--coral-d); }
  .row-btn:disabled { opacity: 0.4; cursor: default; }
  .row-chars { font-family: 'Noto Sans JP', sans-serif; font-size: 13px; display: block; margin-top: 1px; color: var(--charcoal); }
  .all-row-btn { grid-column: 1 / -1; padding: 9px; border: 2px dashed var(--cream2); border-radius: 9px; background: none; cursor: pointer; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 800; color: var(--muted); transition: all 0.15s; }
  .all-row-btn:hover { border-color: var(--coral); color: var(--coral-d); }
  .all-row-btn.active { border-color: var(--coral); background: #f3eeff; color: var(--coral-d); }

  .start-btn {
    width: 100%; padding: 16px; background: linear-gradient(135deg, var(--coral), var(--accent)); color: white; border: none;
    border-radius: 14px; font-family: 'Nunito', sans-serif; font-size: 17px; font-weight: 900;
    cursor: pointer; letter-spacing: 0.03em; box-shadow: 0 8px 22px rgba(255,77,109,0.40);
    transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .start-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(108,76,240,0.45); filter: brightness(1.06); }
  .start-btn:disabled { background: var(--cream2); color: var(--muted); box-shadow: none; cursor: not-allowed; }

  .home-footer { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 4px; }
  .home-footer-text { font-size: 13px; font-weight: 700; color: var(--muted); line-height: 1.5; }
  .home-footer-text em { color: var(--coral); font-style: normal; }

  /* QUIZ */
  .quiz-screen { flex: 1; display: flex; flex-direction: column; padding: 14px; gap: 12px; overflow-y: auto; }
  .progress-wrap { background: var(--cream); border-radius: 13px; padding: 11px 13px; border: 2px solid var(--cream2); }
  .progress-track { background: var(--cream2); border-radius: 99px; height: 9px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--coral) 0%, var(--accent) 100%); border-radius: 99px; transition: width 0.4s ease; }
  .progress-meta { display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: var(--muted); margin-top: 5px; }

  .stats-row { display: flex; gap: 9px; }
  .stat-box { flex: 1; background: var(--cream); border-radius: 11px; padding: 9px 7px; text-align: center; border: 2px solid var(--cream2); }
  .stat-num { font-size: 24px; font-weight: 900; line-height: 1; }
  .stat-num.good { color: var(--correct); }
  .stat-num.bad  { color: var(--wrong); }
  .stat-num.neu  { color: var(--coral); }
  .stat-label { font-size: 10px; font-weight: 800; color: var(--muted); margin-top: 2px; letter-spacing: 0.05em; text-transform: uppercase; }

  .char-card {
    background: linear-gradient(160deg, #ffffff 0%, #f5f1ff 100%); border-radius: 20px; padding: 26px 16px 18px;
    text-align: center; border: 2px solid var(--cream2);
    box-shadow: 0 10px 26px rgba(108,76,240,0.13); position: relative; overflow: hidden;
  }
  .char-card::before { content: ''; position: absolute; top: -22px; right: -22px; width: 78px; height: 78px; border-radius: 50%; background: var(--cream2); opacity: 0.55; }
  .char-display { font-family: 'Noto Sans JP', sans-serif; font-size: 94px; line-height: 1; color: var(--charcoal); position: relative; z-index: 2; }
  .char-display.word { font-size: 40px; padding: 10px 0; }
  .char-type-badge { display: inline-block; margin-top: 7px; padding: 3px 11px; background: white; border-radius: 99px; border: 1.5px solid var(--cream2); font-size: 10px; font-weight: 900; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; position: relative; z-index: 2; }

  .input-area { display: flex; gap: 9px; }
  .romaji-input { flex: 1; padding: 13px 15px; border: 2px solid var(--cream2); border-radius: 13px; font-family: 'Nunito', sans-serif; font-size: 18px; font-weight: 700; color: var(--charcoal); background: white; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
  .romaji-input:focus { border-color: var(--coral); box-shadow: 0 0 0 3px rgba(232,112,90,0.14); }
  .romaji-input.correct { border-color: var(--correct); background: #f0fdf4; }
  .romaji-input.wrong   { border-color: var(--wrong);   background: #fff2f2; }

  .submit-btn { padding: 13px 17px; background: var(--coral); color: white; border: none; border-radius: 13px; font-size: 19px; cursor: pointer; box-shadow: 0 3px 11px rgba(232,112,90,0.33); flex-shrink: 0; transition: transform 0.15s, background 0.15s; }
  .submit-btn:hover { background: var(--coral-d); transform: translateY(-1px); }

  .feedback-card { border-radius: 15px; padding: 15px; text-align: center; animation: popIn 0.25s cubic-bezier(.34,1.56,.64,1); border: 2px solid transparent; }
  @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .feedback-card.correct { background: #f0fdf5; border-color: var(--correct); }
  .feedback-card.wrong   { background: #fff2f2; border-color: var(--wrong); }
  .feedback-icon { font-size: 27px; }
  .feedback-romaji { font-size: 21px; font-weight: 900; color: var(--charcoal); margin-top: 4px; }
  .feedback-english { font-size: 13px; color: var(--muted); font-weight: 700; margin-top: 3px; }
  .feedback-wrong-ans { font-size: 12px; color: var(--wrong); font-weight: 700; margin-top: 5px; }

  .next-btn { width: 100%; padding: 14px; background: var(--charcoal); color: white; border: none; border-radius: 13px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 800; cursor: pointer; transition: background 0.15s, transform 0.15s; }
  .next-btn:hover { background: var(--dark); transform: translateY(-1px); }

  /* RESULTS */
  .results-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 26px 18px; gap: 12px; overflow-y: auto; }
  .results-chibi { animation: bounceIn 0.45s cubic-bezier(.34,1.56,.64,1); }
  @keyframes bounceIn { from { transform: scale(0.5) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  .results-grade { font-size: 36px; font-weight: 900; color: var(--charcoal); text-align: center; line-height: 1; }
  .results-score { font-size: 62px; font-weight: 900; color: var(--coral); text-align: center; line-height: 1; }
  .results-sub { font-size: 13px; font-weight: 700; color: var(--muted); text-align: center; }
  .results-btns { display: flex; gap: 9px; width: 100%; margin-top: 4px; }
  .results-btn { flex: 1; padding: 13px; border: none; border-radius: 13px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: transform 0.15s; }
  .results-btn:hover { transform: translateY(-2px); }
  .results-btn.primary { background: var(--coral); color: white; box-shadow: 0 3px 12px rgba(232,112,90,0.33); }
  .results-btn.secondary { background: var(--cream); color: var(--charcoal); border: 2px solid var(--cream2); }

  /* DIRECTION TOGGLE */
  .direction-selector { display: flex; gap: 8px; }
  .direction-btn { flex: 1; padding: 10px 6px; border: 2px solid var(--cream2); border-radius: 11px; background: white; cursor: pointer; text-align: center; transition: all 0.18s; }
  .direction-btn:hover { border-color: var(--coral-l); }
  .direction-btn.active { border-color: var(--coral); background: #f3eeff; }
  .direction-btn-icon { font-size: 18px; display: block; }
  .direction-btn-label { font-size: 11px; font-weight: 900; color: var(--muted); margin-top: 3px; display: block; }
  .direction-btn.active .direction-btn-label { color: var(--coral-d); }

  /* CUSTOM FLASHCARDS SCREEN */
  .custom-screen { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
  .custom-header { display: flex; align-items: center; justify-content: space-between; }
  .custom-title { font-size: 16px; font-weight: 900; color: var(--charcoal); }
  .custom-count { font-size: 12px; font-weight: 700; color: var(--muted); }
  .custom-add-form { background: var(--cream); border-radius: 14px; padding: 13px; border: 2px solid var(--cream2); display: flex; flex-direction: column; gap: 9px; }
  .custom-input { width: 100%; padding: 10px 13px; border: 2px solid var(--cream2); border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: var(--charcoal); background: white; outline: none; transition: border-color 0.18s; }
  .custom-input:focus { border-color: var(--coral); }
  .custom-input-row { display: flex; gap: 8px; }
  .custom-add-btn { padding: 10px 18px; background: var(--coral); color: white; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 900; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
  .custom-add-btn:hover { background: var(--coral-d); }
  .custom-add-btn:disabled { background: var(--cream2); color: var(--muted); cursor: not-allowed; }
  .custom-list { display: flex; flex-direction: column; gap: 8px; }
  .custom-card { background: var(--cream); border-radius: 12px; padding: 11px 13px; border: 2px solid var(--cream2); display: flex; align-items: center; gap: 10px; }
  .custom-card-text { flex: 1; min-width: 0; }
  .custom-card-jp { font-family: 'Noto Sans JP', sans-serif; font-size: 17px; font-weight: 700; color: var(--charcoal); }
  .custom-card-en { font-size: 12px; font-weight: 700; color: var(--muted); margin-top: 2px; }
  .custom-card-romaji { font-size: 11px; color: var(--coral); font-weight: 700; }
  .custom-delete-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--wrong); opacity: 0.6; transition: opacity 0.15s; flex-shrink: 0; }
  .custom-delete-btn:hover { opacity: 1; }
  .custom-start-btn { width: 100%; padding: 15px; background: var(--coral); color: white; border: none; border-radius: 13px; font-family: 'Nunito', sans-serif; font-size: 16px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 16px rgba(232,112,90,0.36); transition: transform 0.15s, background 0.15s; }
  .custom-start-btn:hover:not(:disabled) { background: var(--coral-d); transform: translateY(-2px); }
  .custom-start-btn:disabled { background: var(--cream2); color: var(--muted); box-shadow: none; cursor: not-allowed; }
  .custom-empty { text-align: center; padding: 28px 16px; color: var(--muted); font-size: 13px; font-weight: 700; }
  .custom-empty-icon { font-size: 36px; display: block; margin-bottom: 8px; }

  /* REFERENCE */
  .ref-screen { flex: 1; overflow-y: auto; padding: 13px 14px 26px; }
  .ref-toggle { display: flex; gap: 8px; margin-bottom: 12px; }
  .ref-toggle-btn { flex: 1; padding: 9px; border: 2px solid var(--cream2); border-radius: 11px; background: var(--cream); font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800; color: var(--muted); cursor: pointer; transition: all 0.15s; }
  .ref-toggle-btn.active { border-color: var(--coral); background: #f3eeff; color: var(--coral-d); }
  .ref-row-label { font-size: 11px; font-weight: 900; color: var(--muted); letter-spacing: 0.09em; text-transform: uppercase; padding: 7px 2px 4px; border-top: 1.5px solid var(--cream2); margin-top: 3px; }
  .ref-chars-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 3px; }
  .ref-cell { background: var(--cream); border: 1.5px solid var(--cream2); border-radius: 9px; padding: 7px 9px; text-align: center; min-width: 50px; }
  .ref-char { font-family: 'Noto Sans JP', sans-serif; font-size: 22px; color: var(--charcoal); display: block; line-height: 1.2; }
  .ref-romaji { font-size: 10px; font-weight: 800; color: var(--muted); margin-top: 2px; }
`;

// ============================================================
// COMPONENT
// ============================================================
export default function RicchaadoAcademy() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("characters");
  const [scriptMode, setScriptMode] = useState("hiragana");
  const [selectedRows, setSelectedRows] = useState(["A-row"]);
  const [allRows, setAllRows] = useState(false);
  const [refScript, setRefScript] = useState("hiragana");
  const [direction, setDirection] = useState("jp-en"); // "jp-en" or "en-jp"
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
  const inputRef = useRef(null);

  // Auth + cloud-synced data (falls back to localStorage when signed out / unconfigured)
  const { user } = useAuth();
  const { cards: customCards, addCard, deleteCard } = useCustomCards();
  const { isPro, buy: buyPro, restore: restorePro } = usePro();
  const srs = useSrs();
  const customCardLimit = isPro ? PRO_LIMITS.customCards : FREE_LIMITS.customCards;
  const { stats: lifetime, recordResult } = useProgress();

  // Custom flashcards (input fields)
  const [newJp, setNewJp] = useState("");
  const [newRomaji, setNewRomaji] = useState("");
  const [newEn, setNewEn] = useState("");
  const [wordCount, setWordCount] = useState(25);
  const [voiceHint, setVoiceHint] = useState(null); // null | "nomatch"

  // Text-to-speech (free, on-device Web Speech API)
  const { speak, supported: ttsSupported } = useSpeech();
  // Speak-to-check (free, native iOS/Android recognizer — hidden on web)
  const { supported: recSupported, listening, listen, error: recError } = useSpeechRecognition();
  const [autoPlay, setAutoPlay] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ricchaado_autoplay") ?? "true"); }
    catch { return true; }
  });
  useEffect(() => {
    localStorage.setItem("ricchaado_autoplay", JSON.stringify(autoPlay));
  }, [autoPlay]);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = BRAND.iconUrl;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const addCustomCard = () => {
    if (!newJp.trim() || !newEn.trim() || customCards.length >= customCardLimit) return;
    addCard({ japanese: newJp.trim(), romaji: newRomaji.trim(), english: newEn.trim() });
    setNewJp(""); setNewRomaji(""); setNewEn("");
  };

  const deleteCustomCard = (id) => deleteCard(id);

  const toggleRow = (name) => {
    setAllRows(false);
    setSelectedRows(p => p.includes(name) ? p.filter(r => r !== name) : [...p, name]);
  };
  const toggleAllRows = () => {
    if (allRows) { setAllRows(false); setSelectedRows(["A-row"]); }
    else { setAllRows(true); setSelectedRows([]); }
  };

  const getPool = useCallback(() => {
    let pool = [];
    if (mode === "characters") {
      const add = (rows, type) => {
        const toUse = allRows ? rows : rows.filter(r => selectedRows.includes(r.name));
        toUse.forEach(r => r.chars.forEach(c => pool.push({ ...c, type, isWord: false })));
      };
      if (scriptMode === "hiragana") add(HIRAGANA_ROWS, "Hiragana");
      else if (scriptMode === "katakana") add(KATAKANA_ROWS, "Katakana");
      else { add(HIRAGANA_ROWS, "Hiragana"); add(KATAKANA_ROWS, "Katakana"); }
    } else {
      const bank = isPro ? WORD_BANK : WORD_BANK.slice(0, FREE_LIMITS.words);
      const words = scriptMode === "both" ? bank : bank.filter(w => w.reading === scriptMode);
      pool = words.map(w => ({ char: w.japanese, romaji: w.romaji, meaning: w.english, isWord: true, type: w.reading === "hiragana" ? "Hiragana" : "Katakana" }));
    }
    return pool;
  }, [mode, scriptMode, selectedRows, allRows, isPro]);

  // Resolve due SRS keys back to quizzable items (kana, words, custom cards).
  const buildReviewPool = () => {
    const wordFor = (jp) => WORD_BANK.find(w => w.japanese === jp);
    const kanaFor = (ch) => {
      for (const rows of [HIRAGANA_ROWS, KATAKANA_ROWS]) {
        for (const r of rows) {
          const hit = r.chars.find(c => c.char === ch);
          if (hit) return { ...hit, type: rows === HIRAGANA_ROWS ? "Hiragana" : "Katakana", isWord: false };
        }
      }
      return null;
    };
    return srs.dueKeys().map((key) => {
      const [kind, val] = [key.slice(0, 1), key.slice(2)];
      if (kind === "k") return kanaFor(val);
      if (kind === "w") {
        const w = wordFor(val);
        return w && { char: w.japanese, romaji: w.romaji, meaning: w.english, isWord: true, type: w.reading === "hiragana" ? "Hiragana" : "Katakana" };
      }
      const c = customCards.find(cc => cc.japanese === val);
      return c && { char: c.japanese, romaji: c.romaji || "", meaning: c.english, isWord: true, type: "Custom", isCustom: true };
    }).filter(Boolean);
  };
  const dueCount = buildReviewPool().length;

  const startReview = () => {
    const pool = buildReviewPool();
    if (!pool.length) return;
    const q = shuffle(pool).slice(0, 30);
    setQueue(q); setCurrent(q[0]); setInput(""); setFeedback(null);
    setStats({ correct: 0, wrong: 0, total: 0 }); setMode("review"); setScreen("quiz");
  };

  const startQuiz = () => {
    const pool = getPool();
    if (!pool.length) return;
    const q = shuffle(pool).slice(0, mode === "words" ? wordCount : Math.min(pool.length, 200));
    setQueue(q); setCurrent(q[0]); setInput(""); setFeedback(null);
    setStats({ correct: 0, wrong: 0, total: 0 }); setScreen("quiz");
  };

  // Fuzzy English match so spoken/typed meanings count: "To fly / jump" ≈ "jump".
  const matchesEnglish = (raw, meaning) => {
    if (!meaning) return false;
    const norm = (s) => s.toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\b(to|a|an|the)\b/g, " ")
      .replace(/\s+/g, " ").trim();
    const said = norm(raw);
    if (!said) return false;
    const options = new Set([norm(meaning)]);
    meaning.split(/[/,;()]/).forEach((p) => { const n = norm(p); if (n) options.add(n); });
    return options.has(said);
  };

  // Evaluate a typed or spoken answer. Romaji and the actual Japanese always
  // count; in JP→English (and custom cards) the English meaning counts too —
  // that's what lets you SAY the English when you see the Japanese.
  const checkAnswer = (raw) => {
    const userInRaw = (raw || "").trim();
    const userIn = userInRaw.toLowerCase();
    const romajiMatch = current.romaji
      ? current.romaji.toLowerCase().split("/").map(r => r.trim()).filter(Boolean).includes(userIn)
      : false;
    const jpMatch = userInRaw === current.char;
    const enMatch = matchesEnglish(userIn, current.meaning);
    let correct;
    if (current.isCustom) correct = romajiMatch || jpMatch || enMatch;
    else if (direction === "jp-en") correct = romajiMatch || jpMatch || enMatch;
    else correct = romajiMatch || jpMatch;
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), wrong: s.wrong + (!correct ? 1 : 0), total: s.total + 1 }));
    setFeedback({ correct, answer: current.romaji || current.char, japanese: current.char, meaning: current.meaning });
    srs.recordAnswer(srsKey(current), correct); // feeds Smart Review scheduling
  };

  const handleSubmit = () => {
    if (!current || feedback) return;
    checkAnswer(input);
  };

  const handleNext = () => {
    const next = queue.slice(1);
    if (!next.length) { setScreen("results"); return; }
    setQueue(next); setCurrent(next[0]); setInput(""); setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const totalItems = queue.length + stats.total;
  const progressPct = totalItems > 0 ? (stats.total / totalItems) * 100 : 0;
  const canStart = mode === "words" ? getPool().length > 0 : mode === "custom" ? customCards.length > 0 : allRows || selectedRows.length > 0;

  const getGrade = () => {
    const pct = stats.total > 0 ? stats.correct / stats.total : 0;
    if (pct >= 0.9) return { label: "優秀! Excellent!", emoji: "🏆" };
    if (pct >= 0.7) return { label: "良い! Great job!", emoji: "⭐" };
    if (pct >= 0.5) return { label: "頑張れ! Keep going!", emoji: "💪" };
    return { label: "練習! Keep practicing!", emoji: "📖" };
  };

  // Auto-play pronunciation. When the prompt already shows Japanese
  // (characters mode / JP→EN) speak it as the card appears; for EN→JP the
  // Japanese is the answer, so speak it when feedback is revealed instead.
  const promptShowsJapanese = (c) => !(direction === "en-jp" && c?.isWord);
  useEffect(() => {
    if (screen === "quiz" && autoPlay && current && !feedback && promptShowsJapanese(current)) {
      speak(current.char);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  useEffect(() => {
    if (feedback && autoPlay && direction === "en-jp" && current?.isWord) {
      speak(current.char);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  // Record each finished quiz once (drives lifetime stats + streak).
  const recordedRef = useRef(false);
  useEffect(() => {
    if (screen === "results") {
      if (!recordedRef.current && stats.total > 0) {
        recordedRef.current = true;
        recordResult({ correct: stats.correct, answered: stats.total });
      }
    } else {
      recordedRef.current = false;
    }
  }, [screen, stats.correct, stats.total, recordResult]);

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* HEADER */}
        <div className="header">
          {(screen === "quiz" || screen === "results" || screen === "paywall") && (
            <button className="back-btn" onClick={() => setScreen(mode === "custom" ? "custom" : "home")}>←</button>
          )}
          <RALogo />
          <div className="header-right">
            <div className="header-course">{BRAND.courseLabel}</div>
            <div className="header-tagline">{BRAND.tagline}</div>
          </div>
        </div>

        {/* NAV */}
        {(screen === "home" || screen === "reference" || screen === "custom" || screen === "account") && (
          <div className="nav-tabs">
            <button className={`nav-tab ${screen === "home" ? "active" : ""}`} onClick={() => setScreen("home")}>🎯 Practice</button>
            <button className={`nav-tab ${screen === "custom" ? "active" : ""}`} onClick={() => setScreen("custom")}>📝 Cards</button>
            <button className={`nav-tab ${screen === "reference" ? "active" : ""}`} onClick={() => setScreen("reference")}>📖 Reference</button>
            <button className={`nav-tab ${screen === "account" ? "active" : ""}`} onClick={() => setScreen("account")}>{user ? "👤 Account" : "🔑 Sign In"}</button>
          </div>
        )}

        {/* HOME */}
        {screen === "home" && (
          <div className="home-screen">
            <div className="hero">
              <div className="hero-text">
                <div className="hero-welcome">Welcome to</div>
                <div className="hero-title">ABSOLUTE<br/><em>BEGINNER</em><br/>JAPANESE</div>
              </div>
              <div className="hero-bg">語</div>
            </div>

            <div className="settings-content">
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 26, lineHeight: 1 }}>🧠</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "var(--charcoal)" }}>
                    Smart Review {!isPro && "⭐"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginTop: 1 }}>
                    {dueCount > 0 ? `${dueCount} item${dueCount === 1 ? "" : "s"} due for review` : "All caught up — nothing due ✨"}
                  </div>
                </div>
                <button
                  onClick={() => (isPro ? startReview() : setScreen("paywall"))}
                  disabled={isPro && dueCount === 0}
                  style={{
                    border: "none", borderRadius: 11, padding: "10px 14px", cursor: isPro && dueCount === 0 ? "default" : "pointer",
                    fontFamily: "'Nunito', sans-serif", fontSize: 13, fontWeight: 900, color: "white", flexShrink: 0,
                    background: isPro && dueCount === 0 ? "var(--cream2)" : "linear-gradient(135deg, var(--coral), var(--accent))",
                  }}>
                  {isPro ? "Review" : "Unlock"}
                </button>
              </div>

              <div>
                <div className="section-label">🎮 Mode</div>
                <div className="mode-selector">
                  <button className={`mode-btn ${mode === "characters" ? "active" : ""}`} onClick={() => setMode("characters")}>
                    <span className="mode-btn-icon">あ</span>
                    <span className="mode-btn-label">Characters</span>
                    <span className="mode-btn-sub">Kana drill</span>
                  </button>
                  <button className={`mode-btn ${mode === "words" ? "active" : ""}`} onClick={() => setMode("words")}>
                    <span className="mode-btn-icon">語</span>
                    <span className="mode-btn-label">Vocabulary</span>
                    <span className="mode-btn-sub">{isPro ? `${WORD_BANK.length} words` : `${FREE_LIMITS.words} of ${WORD_BANK.length} words`}</span>
                  </button>
                </div>
              </div>

              {mode === "words" && (
                <div className="card">
                  <div className="section-label">🔄 Direction</div>
                  <div className="direction-selector">
                    <button className={`direction-btn ${direction === "jp-en" ? "active" : ""}`} onClick={() => setDirection("jp-en")}>
                      <span className="direction-btn-icon">🇯🇵→🇬🇧</span>
                      <span className="direction-btn-label">JP → English</span>
                    </button>
                    <button className={`direction-btn ${direction === "en-jp" ? "active" : ""}`} onClick={() => setDirection("en-jp")}>
                      <span className="direction-btn-icon">🇬🇧→🇯🇵</span>
                      <span className="direction-btn-label">EN → Japanese</span>
                    </button>
                  </div>
                  <div style={{marginTop:"14px"}}>
                    <div className="section-label" style={{marginBottom:"8px"}}>🔢 Number of Words: <strong style={{color:"var(--coral)"}}>{wordCount}</strong></div>
                    <input type="range" min="10" max="200" step="10"
                      value={wordCount}
                      onChange={e => setWordCount(Number(e.target.value))}
                      style={{width:"100%", accentColor:"var(--coral)", cursor:"pointer"}}
                    />
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:"11px", color:"var(--muted)", marginTop:"3px"}}>
                      <span>10</span><span>200</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="section-label">✍️ Script</div>
                <div className="script-selector">
                  <button className={`script-btn ${scriptMode === "hiragana" ? "active" : ""}`} onClick={() => setScriptMode("hiragana")}>
                    <span className="script-char">あ</span><span className="script-label">Hiragana</span>
                  </button>
                  <button className={`script-btn ${scriptMode === "katakana" ? "active" : ""}`} onClick={() => setScriptMode("katakana")}>
                    <span className="script-char">ア</span><span className="script-label">Katakana</span>
                  </button>
                  <button className={`script-btn ${scriptMode === "both" ? "active" : ""}`} onClick={() => setScriptMode("both")}>
                    <span className="script-char" style={{fontSize:19}}>あア</span><span className="script-label">Both</span>
                  </button>
                </div>
              </div>

              {mode === "characters" && (
                <div className="card">
                  <div className="section-label">📚 Rows</div>
                  <div className="row-grid">
                    <button className={`all-row-btn ${allRows ? "active" : ""}`} onClick={toggleAllRows}>✦ All Rows</button>
                    {HIRAGANA_ROWS.map(row => {
                      const disp = scriptMode === "katakana" ? KATAKANA_ROWS.find(r => r.name === row.name) : row;
                      return (
                        <button key={row.name}
                          className={`row-btn ${selectedRows.includes(row.name) ? "active" : ""}`}
                          onClick={() => toggleRow(row.name)} disabled={allRows}>
                          {row.name}
                          <span className="row-chars">{(disp||row).chars.slice(0,2).map(c=>c.char).join("")}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {ttsSupported && (
                <div className="card">
                  <div className="section-label">🔊 Audio</div>
                  <button
                    className={`direction-btn ${autoPlay ? "active" : ""}`}
                    style={{ width: "100%" }}
                    onClick={() => setAutoPlay(a => !a)}>
                    <span className="direction-btn-label">
                      Auto-play pronunciation · {autoPlay ? "On" : "Off"}
                    </span>
                  </button>
                </div>
              )}

              <button className="start-btn" onClick={startQuiz} disabled={!canStart}>
                始める · Start Quiz 🚀
              </button>

              <div className="home-footer">
              <div className="home-footer-text">
                {direction === "en-jp" && mode === "words"
                  ? <>See <em>English</em>, type the<br/><em>romaji or Japanese!</em></>
                  : <>Type the <em>romaji</em> to<br/>unlock the <em>meaning!</em></>}
              </div>
              </div>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {screen === "quiz" && current && (
          <div className="quiz-screen">
            <div className="progress-wrap">
              <div className="progress-track"><div className="progress-fill" style={{width:`${progressPct}%`}}/></div>
              <div className="progress-meta"><span>{stats.total} done</span><span>{queue.length} left</span></div>
            </div>
            <div className="stats-row">
              <div className="stat-box"><div className="stat-num good">{stats.correct}</div><div className="stat-label">Correct</div></div>
              <div className="stat-box"><div className="stat-num bad">{stats.wrong}</div><div className="stat-label">Wrong</div></div>
              <div className="stat-box"><div className="stat-num neu">{stats.total>0?Math.round((stats.correct/stats.total)*100):0}%</div><div className="stat-label">Score</div></div>
            </div>
            <div className="char-card">
              <div className={`char-display ${current.isWord?"word":""}`}>
                {direction === "en-jp" && current.isWord ? current.meaning : current.char}
              </div>
              <div className="char-type-badge">{current.type}{direction === "en-jp" ? " · EN→JP" : ""}</div>
              {ttsSupported && promptShowsJapanese(current) && (
                <button type="button" aria-label="Play pronunciation"
                  onClick={() => speak(current.char)}
                  style={{ marginTop: 10, background: "white", border: "1.5px solid var(--cream2)", borderRadius: 99, padding: "5px 16px", fontSize: 17, cursor: "pointer", position: "relative", zIndex: 2 }}>
                  🔊
                </button>
              )}
            </div>
            {!feedback && (
              <div className="input-area">
                <input ref={inputRef} className="romaji-input"
                  placeholder={direction === "en-jp" ? "Romaji or Japanese..." : "Type romaji here..."}
                  value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  autoFocus autoCapitalize="none" autoCorrect="off" autoComplete="off" spellCheck={false}/>
                {recSupported && current?.isWord && (
                  <button className="submit-btn" type="button"
                    aria-label={direction === "jp-en" && !current.isCustom ? "Say the English meaning" : "Say the Japanese word"}
                    style={{ background: listening ? "var(--wrong)" : "var(--charcoal)" }}
                    onClick={async () => {
                      if (!isPro) { setScreen("paywall"); return; }
                      setVoiceHint(null);
                      const lang = (direction === "jp-en" && !current.isCustom) ? "en-US" : "ja-JP";
                      const heard = await listen(lang);
                      if (heard) { setInput(heard); checkAnswer(heard); }
                      else setVoiceHint("nomatch");
                    }}>
                    {listening ? "…" : isPro ? "🎤" : "🎤⭐"}
                  </button>
                )}
                <button className="submit-btn" onClick={handleSubmit}>→</button>
              </div>
            )}
            {!feedback && recSupported && current?.isWord && (listening || voiceHint || recError) && (
              <div style={{textAlign:"center", fontSize:12, fontWeight:800, marginTop:-4,
                color: listening ? "var(--coral)" : "var(--muted)"}}>
                {listening
                  ? (direction === "jp-en" && !current.isCustom ? "🎤 Listening… say the English meaning (tap 🎤 to finish)" : "🎤 Listening… say it in Japanese (tap 🎤 to finish)")
                  : recError === "denied" ? "Mic access denied — enable it in Settings ▸ your app"
                  : recError === "unavailable" ? "Speech recognition unavailable on this device"
                  : voiceHint === "nomatch" ? "Didn't catch that — tap 🎤 and try again"
                  : ""}
              </div>
            )}
            {feedback && (
              <div className={`feedback-card ${feedback.correct?"correct":"wrong"}`}>
                <div className="feedback-icon">{feedback.correct?"✅":"❌"}</div>
                <div className="feedback-romaji" style={{fontFamily:"'Noto Sans JP',sans-serif"}}>
                  {direction === "en-jp" ? feedback.japanese : feedback.answer}
                </div>
                <div className="feedback-english">{direction === "en-jp" ? feedback.answer : feedback.meaning && `"${feedback.meaning}"`}</div>
                {ttsSupported && (
                  <button type="button" aria-label="Play pronunciation"
                    onClick={() => speak(feedback.japanese || current.char)}
                    style={{ marginTop: 8, background: "white", border: "1.5px solid var(--cream2)", borderRadius: 99, padding: "4px 14px", fontSize: 15, cursor: "pointer" }}>
                    🔊 Hear it
                  </button>
                )}
                {!feedback.correct && <div className="feedback-wrong-ans">You typed: {input||"(nothing)"}</div>}
              </div>
            )}
            {feedback && (
              <button className="next-btn" onClick={handleNext}>
                {queue.length===1?"See Results! 🎉":"Next →"}
              </button>
            )}
          </div>
        )}

        {/* RESULTS */}
        {screen === "results" && (() => {
          const g = getGrade();
          const pct = stats.total>0?Math.round((stats.correct/stats.total)*100):0;
          return (
            <div className="results-screen">
              <div className="results-grade">{g.emoji} {g.label}</div>
              <div className="results-score">{pct}%</div>
              <div className="results-sub">{stats.correct} / {stats.total} correct</div>
              <div className="stats-row" style={{width:"100%"}}>
                <div className="stat-box"><div className="stat-num good">{stats.correct}</div><div className="stat-label">Correct</div></div>
                <div className="stat-box"><div className="stat-num bad">{stats.wrong}</div><div className="stat-label">Wrong</div></div>
              </div>
              {lifetime && lifetime.totalQuizzes > 0 && (
                <div className="results-sub">
                  🔥 {lifetime.currentStreak}-day streak · Best {lifetime.bestStreak} · {lifetime.totalQuizzes} quizzes done
                </div>
              )}
              <div className="results-btns">
                <button className="results-btn secondary" onClick={()=>setScreen("home")}>← Settings</button>
                <button className="results-btn primary"
                  onClick={mode === "review" ? (dueCount > 0 ? startReview : () => setScreen("home")) : startQuiz}>
                  {mode === "review" ? (dueCount > 0 ? "Keep Reviewing 🧠" : "Done ✨") : "Try Again 🚀"}
                </button>
              </div>
            </div>
          );
        })()}

        {/* CUSTOM FLASHCARDS */}
        {screen === "custom" && (
          <div className="custom-screen">
            <div className="custom-header">
              <div className="custom-title">📝 My Flashcards</div>
              <div className="custom-count">
                {customCards.length} / {customCardLimit} cards
                {!isPro && (
                  <button onClick={() => setScreen("paywall")}
                    style={{ background: "none", border: "none", color: "var(--accent)", fontFamily: "'Nunito', sans-serif", fontSize: 12, fontWeight: 900, cursor: "pointer", marginLeft: 6 }}>
                    ⭐ Get 200
                  </button>
                )}
              </div>
            </div>

            {customCards.length < customCardLimit && (
              <div className="custom-add-form">
                <div className="section-label">➕ Add a Card</div>
                <input className="custom-input" placeholder="Japanese (e.g. ありがとう)"
                  value={newJp} onChange={e => setNewJp(e.target.value)} />
                <input className="custom-input" placeholder="Romaji (e.g. arigatou)"
                  value={newRomaji} onChange={e => setNewRomaji(e.target.value)} />
                <div className="custom-input-row">
                  <input className="custom-input" placeholder="English meaning"
                    value={newEn} onChange={e => setNewEn(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCustomCard()} style={{flex:1}} />
                  <button className="custom-add-btn"
                    onClick={addCustomCard}
                    disabled={!newJp.trim() || !newEn.trim()}>Add</button>
                </div>
              </div>
            )}

            <button className="custom-start-btn"
              disabled={customCards.length === 0}
              onClick={() => {
                const pool = shuffle(customCards).slice(0, 25).map(c => ({
                  char: c.japanese, romaji: c.romaji || "", meaning: c.english,
                  isWord: true, type: "Custom", isCustom: true
                }));
                setQueue(pool); setCurrent(pool[0]); setInput(""); setFeedback(null);
                setStats({ correct: 0, wrong: 0, total: 0 });
                setMode("custom"); setDirection("jp-en"); setScreen("quiz");
              }}>
              始める · Quiz My Cards 🚀 ({customCards.length})
            </button>

            {customCards.length === 0 ? (
              <div className="custom-empty">
                <span className="custom-empty-icon">🃏</span>
                Add your own words and phrases above to get started!
              </div>
            ) : (
              <div className="custom-list">
                <div className="section-label">Your Cards</div>
                {customCards.map(card => (
                  <div className="custom-card" key={card.id}>
                    <div className="custom-card-text">
                      <div className="custom-card-jp">{card.japanese}</div>
                      {card.romaji && <div className="custom-card-romaji">{card.romaji}</div>}
                      <div className="custom-card-en">{card.english}</div>
                    </div>
                    <button className="custom-delete-btn" onClick={() => deleteCustomCard(card.id)}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REFERENCE */}
        {screen === "reference" && (
          <div className="ref-screen">
            <div className="ref-toggle">
              <button className={`ref-toggle-btn ${refScript==="hiragana"?"active":""}`} onClick={()=>setRefScript("hiragana")}>あ Hiragana</button>
              <button className={`ref-toggle-btn ${refScript==="katakana"?"active":""}`} onClick={()=>setRefScript("katakana")}>ア Katakana</button>
            </div>
            {ttsSupported && (
              <div style={{textAlign:"center", fontSize:12, fontWeight:700, color:"var(--muted)", margin:"2px 0 6px"}}>
                🔊 Tap any character to hear it
              </div>
            )}
            {(refScript==="hiragana"?HIRAGANA_ROWS:KATAKANA_ROWS).map(row=>(
              <div key={row.name}>
                <div className="ref-row-label">{row.name}</div>
                <div className="ref-chars-row">
                  {row.chars.map(c=>(
                    <div className="ref-cell" key={c.char}
                      onClick={() => ttsSupported && speak(c.char)}
                      style={ttsSupported ? { cursor: "pointer" } : undefined}>
                      <span className="ref-char">{c.char}</span>
                      <div className="ref-romaji">{c.romaji}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACCOUNT */}
        {screen === "account" && <AccountScreen lifetime={lifetime} />}

        {/* PAYWALL */}
        {screen === "paywall" && (
          <Paywall isPro={isPro} onBuy={buyPro} onRestore={restorePro} onClose={() => setScreen("home")} />
        )}

      </div>
    </>
  );
}
