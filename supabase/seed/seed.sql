-- 자동 생성 파일: build-seed.mjs
insert into public.categories (slug, name, sort_order) values
  ('boards', '개발보드', 1),
  ('sensors', '센서', 2),
  ('modules', '모듈', 3),
  ('parts', '부품', 4),
  ('kits', '키트', 5),
  ('tools', '공구', 6)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.products (category_id, slug, name, summary, price, stock, specs, image, devicemart_url)
select c.id, v.slug, v.name, v.summary, v.price, v.stock, v.specs::jsonb, v.image, v.devicemart_url
from (values
  ('boards', 'arduino-uno-r3', '아두이노 우노 R3 (정품)', 'ATmega328P 기반의 가장 대표적인 아두이노 정품 입문 보드입니다.', 31900, 120, '{"MCU":"ATmega328P","동작전압":"5V","디지털 I/O":"14핀","아날로그 입력":"6핀"}', '/images/products/arduino-uno-r3.jpg', 'https://www.devicemart.co.kr/goods/view?no=34404'),
  ('boards', 'arduino-uno-r4-wifi', '아두이노 우노 R4 WiFi', 'ESP32-S3 무선 모듈과 12x8 LED 매트릭스를 탑재한 차세대 우노 보드입니다.', 42130, 60, '{"MCU":"Renesas RA4M1","무선":"Wi-Fi / BLE (ESP32-S3)","USB":"USB-C","LED 매트릭스":"12x8"}', '/images/products/arduino-uno-r4-wifi.jpg', 'https://www.devicemart.co.kr/goods/view?no=15088648'),
  ('boards', 'arduino-nano', '아두이노 나노 (호환)', '브레드보드에 바로 꽂아 쓰는 소형 아두이노 나노 호환보드입니다.', 6050, 180, '{"MCU":"ATmega328P","USB 칩":"CH340","동작전압":"5V"}', '/images/products/arduino-nano.jpg', 'https://www.devicemart.co.kr/goods/view?no=1342039'),
  ('boards', 'arduino-mega-2560', '아두이노 메가 2560 R3 (호환)', '54개 디지털 핀으로 대형 프로젝트에 적합한 메가 2560 호환보드입니다.', 19800, 70, '{"MCU":"ATmega2560","디지털 I/O":"54핀","아날로그 입력":"16핀","USB 칩":"CH340"}', '/images/products/arduino-mega-2560.jpg', 'https://www.devicemart.co.kr/goods/view?no=10918650'),
  ('boards', 'esp32-devkit', 'ESP32 개발보드 (DevKitC)', 'Wi-Fi와 블루투스를 내장한 듀얼코어 IoT 개발보드입니다.', 9900, 110, '{"모듈":"ESP32-WROOM-32D","무선":"Wi-Fi / Bluetooth","USB 칩":"CP2102","동작전압":"3.3V"}', '/images/products/esp32-devkit.jpg', 'https://www.devicemart.co.kr/goods/view?no=15313999'),
  ('sensors', 'hc-sr04', 'HC-SR04 초음파 거리 센서', '초음파로 2cm~4m 거리를 측정하는 인기 거리 센서입니다.', 1210, 200, '{"측정 거리":"2cm ~ 400cm","동작전압":"5V","인터페이스":"Trig / Echo"}', '/images/products/hc-sr04.jpg', 'https://www.devicemart.co.kr/goods/view?no=1076851'),
  ('sensors', 'dht11', 'DHT11 온습도 센서 모듈', '온도와 습도를 디지털 신호 하나로 읽을 수 있는 기본 센서 모듈입니다.', 1760, 190, '{"온도 범위":"0 ~ 50℃ (±2℃)","습도 범위":"20 ~ 90%RH (±5%)","동작전압":"3.3V ~ 5V"}', '/images/products/dht11.jpg', 'https://www.devicemart.co.kr/goods/view?no=1278926'),
  ('sensors', 'hc-sr501', 'HC-SR501 PIR 인체감지 센서', '적외선으로 사람의 움직임을 감지하며 감도와 지연시간을 조절할 수 있습니다.', 1650, 150, '{"감지 거리":"최대 약 7m","감지 각도":"약 120°","동작전압":"5V ~ 20V","출력":"디지털 HIGH/LOW"}', '/images/products/hc-sr501.jpg', 'https://www.devicemart.co.kr/goods/view?no=1287086'),
  ('sensors', 'mpu6050', 'MPU-6050 6축 자이로/가속도 센서', '3축 가속도와 3축 자이로를 하나로 측정하는 GY-521 모듈입니다.', 4950, 130, '{"칩":"MPU-6050","인터페이스":"I2C","가속도 범위":"±2/4/8/16g","자이로 범위":"±250~2000°/s"}', '/images/products/mpu6050.jpg', 'https://www.devicemart.co.kr/goods/view?no=1247052'),
  ('sensors', 'soil-moisture', '토양 수분 센서 모듈', '화분 흙의 수분량을 아날로그 값으로 측정해 자동 급수 프로젝트에 활용합니다.', 4840, 90, '{"출력":"아날로그","동작전압":"3.3V ~ 5V","방식":"저항식 프로브"}', '/images/products/soil-moisture.jpg', 'https://www.devicemart.co.kr/goods/view?no=1066974'),
  ('modules', 'sg90', 'SG90 마이크로 서보모터', '0~180도 각도 제어가 가능한 9g 초소형 서보모터입니다.', 2090, 200, '{"토크":"1.8kg·cm (4.8V)","속도":"0.1s/60°","동작전압":"4.8V ~ 6V","무게":"9g"}', '/images/products/sg90.jpg', 'https://www.devicemart.co.kr/goods/view?no=1128421'),
  ('modules', '28byj48', '28BYJ-48 스텝모터 + ULN2003 드라이버', '정밀한 회전 제어가 가능한 5V 스텝모터와 전용 드라이버 세트입니다.', 2310, 100, '{"모터":"28BYJ-48 (4상 5선)","드라이버":"ULN2003","동작전압":"5V","감속비":"1/64"}', '/images/products/28byj48.jpg', 'https://www.devicemart.co.kr/goods/view?no=1327608'),
  ('modules', 'l298n', 'L298N 모터 드라이버 모듈', 'DC 모터 2개 또는 스텝모터 1개를 구동하는 듀얼 H-브리지 드라이버입니다.', 2970, 80, '{"칩":"L298N","구동 전압":"5V ~ 35V","출력 전류":"채널당 2A","채널":"2"}', '/images/products/l298n.jpg', 'https://www.devicemart.co.kr/goods/view?no=1278835'),
  ('modules', 'relay-1ch', '5V 1채널 릴레이 모듈', '아두이노로 AC 250V 가전까지 켜고 끌 수 있는 1채널 릴레이입니다.', 1210, 160, '{"코일 전압":"5V","최대 부하":"AC 250V 10A / DC 30V 10A","채널":"1"}', '/images/products/relay-1ch.jpg', 'https://www.devicemart.co.kr/goods/view?no=1320897'),
  ('modules', 'lcd1602-i2c', '1602 LCD I2C 모듈', 'I2C 어댑터가 부착되어 4선만으로 연결되는 16x2 문자 LCD입니다.', 2750, 120, '{"표시":"16문자 x 2줄","인터페이스":"I2C (0x27)","백라이트":"블루","동작전압":"5V"}', '/images/products/lcd1602-i2c.jpg', 'https://www.devicemart.co.kr/goods/view?no=1327456'),
  ('modules', 'oled-096', '0.96인치 OLED 디스플레이 (I2C)', '선명한 128x64 해상도로 그래픽과 텍스트를 표시하는 소형 OLED입니다.', 10780, 140, '{"해상도":"128 x 64","드라이버":"SSD1306","인터페이스":"I2C","동작전압":"3.3V ~ 5V"}', '/images/products/oled-096.jpg', 'https://www.devicemart.co.kr/goods/view?no=1311755'),
  ('parts', 'breadboard-830', '브레드보드 830홀', '납땜 없이 회로를 구성할 수 있는 MB-102 규격 830홀 브레드보드입니다.', 1540, 200, '{"홀 수":"830","규격":"MB-102","크기":"165 x 55 x 8.5mm"}', '/images/products/breadboard-830.jpg', 'https://www.devicemart.co.kr/goods/view?no=1322408'),
  ('parts', 'jumper-wire', '점퍼 와이어 세트 (M-M 40P)', '브레드보드 배선에 쓰는 20cm 수-수 컬러 점퍼 케이블 40가닥입니다.', 935, 200, '{"타입":"Male - Male","수량":"40가닥","길이":"20cm","피치":"2.54mm"}', '/images/products/jumper-wire.jpg', 'https://www.devicemart.co.kr/goods/view?no=1321196'),
  ('parts', 'led-kit', '5mm LED 세트', '여러 색상의 5mm LED를 모은 실습용 세트입니다.', 10450, 150, '{"크기":"5mm","수량":"20개","색상":"혼합"}', '/images/products/led-kit.jpg', 'https://www.devicemart.co.kr/goods/view?no=1313558'),
  ('parts', 'resistor-kit', '저항 키트', '1Ω부터 3MΩ까지 130종 저항을 각 20개씩 담은 샘플 키트입니다.', 17600, 60, '{"종류":"130종","수량":"각 20개 (총 2,600개)","정격":"1/4W","오차":"±1%"}', '/images/products/resistor-kit.jpg', 'https://www.devicemart.co.kr/goods/view?no=12533737'),
  ('kits', 'arduino-starter-kit', '아두이노 스타터 키트', '정품 우노 보드와 부품, 15가지 프로젝트 가이드북이 포함된 공식 한글판 키트입니다.', 152900, 30, '{"구성":"Arduino UNO + 부품 일체","가이드북":"한글판 (15 프로젝트)","대상":"입문자"}', '/images/products/arduino-starter-kit.jpg', 'https://www.devicemart.co.kr/goods/view?no=1149109'),
  ('tools', 'multimeter', '디지털 멀티미터', '전압·전류·저항과 온도까지 측정하는 휴대용 디지털 멀티미터입니다.', 29700, 40, '{"모델":"Mastech MAS838","측정":"DCV / ACV / DCA / Ω / 온도","표시":"LCD"}', '/images/products/multimeter.jpg', 'https://www.devicemart.co.kr/goods/view?no=10038')
) as v(category, slug, name, summary, price, stock, specs, image, devicemart_url)
join public.categories c on c.slug = v.category
on conflict (slug) do update set
  category_id = excluded.category_id, name = excluded.name, summary = excluded.summary,
  price = excluded.price, specs = excluded.specs, image = excluded.image, devicemart_url = excluded.devicemart_url;
