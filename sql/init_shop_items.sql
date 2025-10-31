-- ============================================
-- 상점 아이템 데이터 초기화 SQL (Oracle)
-- 프론트엔드에서 사용하는 아이템들을 DB에 추가
-- ============================================

-- ============================================
-- 1. 테두리 상품 (BORDER)
-- ============================================

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_default', 'BORDER', '기본 테두리', '기본 프로필 테두리', 0, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_gold', 'BORDER', '골드 테두리', '화려한 골드 테두리', 100, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_silver', 'BORDER', '실버 테두리', '우아한 실버 테두리', 50, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_rainbow', 'BORDER', '무지개 테두리', '화려한 무지개 테두리', 200, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_diamond', 'BORDER', '다이아몬드 테두리', '고급 다이아몬드 테두리', 500, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_fire', 'BORDER', '불꽃 테두리', '타오르는 불꽃 테두리', 300, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_ice', 'BORDER', '차가운 얼음 테두리', '차가운 얼음 테두리', 250, 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'border_lightning', 'BORDER', '번개 테두리', '번개가 치는 테두리', 400, 1, CURRENT_TIMESTAMP);

-- ============================================
-- 2. 배너 상품 (BANNER)
-- ============================================

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_default', 'BANNER', '기본 배너', '기본 프로필 배너', 0, 
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_ahri', 'BANNER', '아리 배너', '구미호 아리의 매혹적인 배너', 200,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_yasuo', 'BANNER', '야스오 배너', '바람검사 야스오의 배너', 250,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_jinx', 'BANNER', '징크스 배너', '폭주하는 징크스의 배너', 180,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_thresh', 'BANNER', '쓰레쉬 배너', '사슬 감옥수 쓰레쉬의 배너', 300,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_zed', 'BANNER', '제드 배너', '그림자 단 제드의 배너', 280,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_lux', 'BANNER', '럭스 배너', '빛의 소녀 럭스의 배너', 150,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'banner_darius', 'BANNER', '다리우스 배너', '녹서스의 손 다리우스의 배너', 220,
        'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Darius_0.jpg', 1, CURRENT_TIMESTAMP);

-- ============================================
-- 3. 챔피언 스티커 (STICKER)
-- 주요 챔피언들 추가
-- ============================================

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Ahri', 'STICKER', '아리 스티커', '구미호 아리 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ahri.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Yasuo', 'STICKER', '야스오 스티커', '바람검사 야스오 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Yasuo.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Jinx', 'STICKER', '징크스 스티커', '폭주하는 징크스 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Jinx.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Thresh', 'STICKER', '쓰레쉬 스티커', '사슬 감옥수 쓰레쉬 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Thresh.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Zed', 'STICKER', '제드 스티커', '그림자 단 제드 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Zed.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Lux', 'STICKER', '럭스 스티커', '빛의 소녀 럭스 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lux.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Darius', 'STICKER', '다리우스 스티커', '녹서스의 손 다리우스 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Darius.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Aatrox', 'STICKER', '아트록스 스티커', '다르킨의 검 아트록스 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Aatrox.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Garen', 'STICKER', '가렌 스티커', '데마시아의 힘 가렌 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Garen.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Katarina', 'STICKER', '카타리나 스티커', '사악한 칼날 카타리나 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Katarina.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_LeeSin', 'STICKER', '리 신 스티커', '맹목적 수도승 리 신 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/LeeSin.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Vayne', 'STICKER', '베인 스티커', '어둠의 사냥꾼 베인 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Vayne.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_MasterYi', 'STICKER', '마스터 이 스티커', '우주류 검사 마스터 이 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/MasterYi.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_MissFortune', 'STICKER', '미스 포츈 스티커', '해적의 무법자 미스 포츈 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/MissFortune.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Caitlyn', 'STICKER', '케이틀린 스티커', '필트오버의 보안관 케이틀린 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Caitlyn.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Ashe', 'STICKER', '애쉬 스티커', '서리의 궁수 애쉬 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Ashe.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Sona', 'STICKER', '소나 스티커', '현의 귀재 소나 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Sona.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Soraka', 'STICKER', '소라카 스티커', '별의 아이 소라카 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Soraka.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Janna', 'STICKER', '잔나 스티커', '폭풍의 분노 잔나 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Janna.png', 'champion', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_champion_Lulu', 'STICKER', '룰루 스티커', '요정 마법사 룰루 스티커', 30,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/champion/Lulu.png', 'champion', 1, CURRENT_TIMESTAMP);

-- ============================================
-- 4. 아이템 스티커 (STICKER)
-- 주요 아이템들 추가
-- ============================================

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3089', 'STICKER', '라바돈의 죽음모자 스티커', '아이템 스티커', 92,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3089.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3031', 'STICKER', '무한의 대검 스티커', '아이템 스티커', 88,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3031.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3071', 'STICKER', '칠흑의 양날 도끼 스티커', '아이템 스티커', 84,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3071.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3026', 'STICKER', '수호 천사 스티커', '아이템 스티커', 76,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3026.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3157', 'STICKER', '존야의 모래시계 스티커', '아이템 스티커', 80,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3157.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3036', 'STICKER', '도미닉 경의 인사 스티커', '아이템 스티커', 84,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3036.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3072', 'STICKER', '피바라기 스티커', '아이템 스티커', 80,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3072.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1001', 'STICKER', '장화 스티커', '아이템 스티커', 26,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1001.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3006', 'STICKER', '광전사의 군화 스티커', '아이템 스티커', 42,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3006.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3153', 'STICKER', '몰락한 왕의 검 스티커', '아이템 스티커', 86,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3153.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3003', 'STICKER', '대천사의 지팡이 스티커', '아이템 스티커', 42,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3003.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3035', 'STICKER', '최후의 속삭임 스티커', '아이템 스티커', 80,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3035.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_3004', 'STICKER', '마나무네 스티커', '아이템 스티커', 21,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/3004.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_2003', 'STICKER', '체력 물약 스티커', '아이템 스티커', 21,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/2003.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1036', 'STICKER', '롱소드 스티커', '아이템 스티커', 27,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1036.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1038', 'STICKER', 'B.F. 대검 스티커', '아이템 스티커', 46,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1038.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1037', 'STICKER', '곡괭이 스티커', '아이템 스티커', 38,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1037.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1042', 'STICKER', '단검 스티커', '아이템 스티커', 26,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1042.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1055', 'STICKER', '도란의 검 스티커', '아이템 스티커', 29,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1055.png', 'item', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_item_1056', 'STICKER', '도란의 반지 스티커', '아이템 스티커', 28,
        'https://ddragon.leagueoflegends.com/cdn/15.18.1/img/item/1056.png', 'item', 1, CURRENT_TIMESTAMP);

-- ============================================
-- 5. 룬 스티커 (STICKER)
-- 주요 룬 스타일 및 인기 룬들 추가
-- ============================================

-- 룬 스타일
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_style_8000', 'STICKER', '정밀 스티커', '정밀 룬 스타일 스티커', 40,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Precision.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_style_8100', 'STICKER', '지배 스티커', '지배 룬 스타일 스티커', 40,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Domination.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_style_8200', 'STICKER', '마법 스티커', '마법 룬 스타일 스티커', 40,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Sorcery.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_style_8300', 'STICKER', '영감 스티커', '영감 룬 스타일 스티커', 40,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/Inspiration.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_style_8400', 'STICKER', '결의 스티커', '결의 룬 스타일 스티커', 40,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Resolve.png', 'rune', 1, CURRENT_TIMESTAMP);

-- 주요 룬 (정밀)
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8005', 'STICKER', '치명적 속도 스티커', '공격 속도가 증가합니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8008', 'STICKER', '정복자 스티커', '전투에서 지속적으로 강해집니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Conqueror/Conqueror.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8021', 'STICKER', '정밀한 공격 스티커', '연속 공격 시 추가 피해를 입힙니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png', 'rune', 1, CURRENT_TIMESTAMP);

-- 주요 룬 (지배)
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8124', 'STICKER', '포식자 스티커', '이동 속도가 증가합니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Predator/Predator.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8128', 'STICKER', '어둠의 수확 스티커', '적 처치 시 추가 피해를 입힙니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png', 'rune', 1, CURRENT_TIMESTAMP);

-- 주요 룬 (마법)
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8214', 'STICKER', '소환: 아이오니아의 의지 스티커', '스킬 가속이 증가합니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/SummonAery/SummonAery.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8229', 'STICKER', '신비로운 유물 스티커', '아이템 효과가 강화됩니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png', 'rune', 1, CURRENT_TIMESTAMP);

-- 주요 룬 (영감)
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8351', 'STICKER', '빙결 강화 스티커', '빙결 효과가 강화됩니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8352', 'STICKER', '신비로운 유물 스티커', '아이템 효과가 강화됩니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png', 'rune', 1, CURRENT_TIMESTAMP);

-- 주요 룬 (결의)
INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8437', 'STICKER', '수호자 스티커', '아군을 보호합니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Guardian/Guardian.png', 'rune', 1, CURRENT_TIMESTAMP);

INSERT INTO SHOP_ITEMS (ID, ITEM_CODE, ITEM_TYPE, NAME, DESCRIPTION, PRICE, IMAGE_URL, CATEGORY, IS_ACTIVE, CREATED_AT)
VALUES (SHOP_ITEMS_SEQ.NEXTVAL, 'sticker_rune_8446', 'STICKER', '과다치유 스티커', '체력 회복이 강화됩니다', 35,
        'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png', 'rune', 1, CURRENT_TIMESTAMP);

-- ============================================
-- 확인 쿼리
-- ============================================

-- 상품 목록 확인
SELECT ITEM_CODE, ITEM_TYPE, NAME, PRICE, IS_ACTIVE 
FROM SHOP_ITEMS 
ORDER BY ITEM_TYPE, NAME;

-- 상품 개수 확인
SELECT ITEM_TYPE, COUNT(*) AS COUNT 
FROM SHOP_ITEMS 
GROUP BY ITEM_TYPE
ORDER BY ITEM_TYPE;

-- 카테고리별 스티커 개수 확인
SELECT CATEGORY, COUNT(*) AS COUNT 
FROM SHOP_ITEMS 
WHERE ITEM_TYPE = 'STICKER' AND CATEGORY IS NOT NULL
GROUP BY CATEGORY
ORDER BY CATEGORY;

