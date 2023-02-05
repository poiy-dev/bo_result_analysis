const MESSAGE_CHOOSE_FILE = "ファイルを選択してください";
const MESSAGE_ERROR_CSV = "CSV読み込み時にエラーが発生しました";
const MESSAGE_READING_FILE = "ファイル読み込み中...";

const CHART1_LABEL = ["1~100", "101~200", "201~300", "301~400", "401~500", "501~600", "601~700", "701~800", "801~900", "901~1000"];
const CHART1_LABEL_VAL = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const CHART2_LABEL = ["2~15", "16~30", "31~45", "46~60", "61~75", "76~90", "91~105", "106~120", "121~150", "151~180"];
const CHART2_LABEL_VAL = [15, 30, 45, 60, 75, 90, 105, 120, 150, 180];
const CHART3_LABEL = ["11", "13", "15", "17", "19", "21", "23", "01", "03", "05"];
const CHART3_LABEL_VAL = [11, 13, 15, 17, 21, 23, 01, 03, 05];


const CSV_HEAD_FUND = "通貨ペア";
const CSV_HEAD_DUE_TIME = "満期日時";
const CSV_HEAD_TRADE_TYPE = "取引種類";
const CSV_HEAD_CONTRACT_PRICE = "約定価格";
const CSV_HEAD_FIXED_PROFIT = "確定損益";
const CSV_HEAD_ORDER_KEY = "注文No";
const CSV_HEAD_CONTRACT_TIME = "約定日時"
const CSV_HEAD_TARGET_ORDER_KEY = "決済対象";

const FUND_TYPE_USD_JPY = "USD/JPY";
const FUND_TYPE_EUR_JPY = "EUR/JPY";
const FUND_TYPE_GBP_JPY = "GBP/JPY";
const FUND_TYPE_AUD_JPY = "AUD/JPY";
const FUND_TYPE_EUR_USD = "EUR/USD";

const TRADE_TYPE_BUY = "購入";
const TRADE_TYPE_SELL = "売却";
const TRADE_TYPE_DUE_HIT = "満期（ヒット）";
const TRADE_TYPE_DUE_OUT = "満期（アウト）";

const TITLE_CONTRACT_PRICE = "オプション価格帯による損益合計";
const TITLE_CONTRACT_TIME = "残り時間帯による損益合計";
const TITLE_DUE_TIME = "満期時間による損益合計";
const TITLE_RELATION_TIME_PRICE = "残り時間と約定価格による損益合計"

const CIRCLE_RADIUS_MIN = 2;
const CIRCLE_RADIUS_MAX = 10;
