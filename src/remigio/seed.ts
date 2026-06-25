// Partidas históricas de brisca-app importadas a ludotic.
// Generado automáticamente desde database-cinnabar-yacht.db.
// Se cargan una sola vez en IndexedDB (ver useRemigioStore.load).
import { RemigioSession } from './types';

export const remigioSeed: RemigioSession[] = [
  {
    "id": "bf40a7a1-85a7-4e25-9d62-6a6308377ba5",
    "name": "17-05-2026",
    "status": "in_progress",
    "max_players": 8,
    "target_score": 150,
    "price_per_round": 0.1,
    "price_per_game": 0.1,
    "price_per_reentry": 0.1,
    "created_at": "2026-05-17T13:12:10.237805+00:00",
    "players": [
      {
        "id": "d21aae7d-afc6-4e69-9083-70215bd3db5d",
        "guest_name": "Abuela",
        "current_score": 112,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 0,
        "position": 1
      },
      {
        "id": "76ce2d76-d600-4109-bd7f-d7d17d0e21f3",
        "guest_name": "Ana",
        "current_score": 144,
        "status": "active",
        "reentry_count": 1,
        "total_rounds_won": 0,
        "position": 2
      },
      {
        "id": "85618282-82a9-4159-b80e-8d628b99cca2",
        "guest_name": "Frank",
        "current_score": 25,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 0,
        "position": 3
      },
      {
        "id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "guest_name": "Cristina",
        "current_score": 18,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 1,
        "position": 4
      },
      {
        "id": "701211ca-e994-466b-8a2d-fcc6046a035c",
        "guest_name": "Elena",
        "current_score": 63,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 0,
        "position": 5
      },
      {
        "id": "2d18ccbe-5723-4a29-b0c5-9ef69463a750",
        "guest_name": "Albert",
        "current_score": 144,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 0,
        "position": 6
      },
      {
        "id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "guest_name": "Marc",
        "current_score": 35,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 1,
        "position": 7
      }
    ],
    "rounds": [
      {
        "id": "bdbc7436-d30b-4c80-b51c-ab8f9fc22c32",
        "round_number": 1,
        "winner_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "completed_at": "2026-05-17T14:35:50.203+00:00",
        "scores": [
          {
            "id": "499a6a18-2249-4450-b120-831126dff797",
            "game_player_id": "d21aae7d-afc6-4e69-9083-70215bd3db5d",
            "points": 12
          },
          {
            "id": "181008f5-9160-495a-bdbf-3c0cf4b768c8",
            "game_player_id": "76ce2d76-d600-4109-bd7f-d7d17d0e21f3",
            "points": 96
          },
          {
            "id": "826159a5-866e-4f4b-93f3-82567c397aa5",
            "game_player_id": "85618282-82a9-4159-b80e-8d628b99cca2",
            "points": 10
          },
          {
            "id": "d728eeba-ed83-4150-82e1-7415259a9926",
            "game_player_id": "e101f266-81d0-4865-923b-c35733f8b7af",
            "points": 18
          },
          {
            "id": "601cd5cb-7916-4649-b895-6be32336799b",
            "game_player_id": "701211ca-e994-466b-8a2d-fcc6046a035c",
            "points": 25
          },
          {
            "id": "425d530b-d742-4ca3-9328-95dd89274b4c",
            "game_player_id": "2d18ccbe-5723-4a29-b0c5-9ef69463a750",
            "points": 43
          },
          {
            "id": "93e02ddf-b1c9-489a-9851-45536d171661",
            "game_player_id": "c031746e-3347-4d5d-ae65-c688749e396d",
            "points": 0
          }
        ]
      },
      {
        "id": "fb5f5ca4-3679-4f01-808a-e810c04136ee",
        "round_number": 2,
        "winner_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "completed_at": "2026-05-17T14:58:04.248+00:00",
        "scores": [
          {
            "id": "b10b2c95-e40e-49de-9608-338ea8f17532",
            "game_player_id": "d21aae7d-afc6-4e69-9083-70215bd3db5d",
            "points": 100
          },
          {
            "id": "884ee9ad-044e-4c45-99f0-3e677c5dc5e1",
            "game_player_id": "76ce2d76-d600-4109-bd7f-d7d17d0e21f3",
            "points": 100
          },
          {
            "id": "3b0c366d-e60b-4792-a7e0-e95a4ade441b",
            "game_player_id": "85618282-82a9-4159-b80e-8d628b99cca2",
            "points": 15
          },
          {
            "id": "9710b131-751c-4cc5-8f34-aa713a23e591",
            "game_player_id": "e101f266-81d0-4865-923b-c35733f8b7af",
            "points": 0
          },
          {
            "id": "09705f7d-f21f-48eb-8279-db60844a961c",
            "game_player_id": "701211ca-e994-466b-8a2d-fcc6046a035c",
            "points": 38
          },
          {
            "id": "fd5dca87-5441-4289-bcc8-627cb225c2f1",
            "game_player_id": "2d18ccbe-5723-4a29-b0c5-9ef69463a750",
            "points": 101
          },
          {
            "id": "ebfeef3d-ffb1-4aca-a287-f2e00007f485",
            "game_player_id": "c031746e-3347-4d5d-ae65-c688749e396d",
            "points": 35
          }
        ]
      }
    ],
    "transactions": [
      {
        "id": "e6e58bb9-4c6a-4d2b-bc8a-e17c48f24add",
        "game_player_id": "d21aae7d-afc6-4e69-9083-70215bd3db5d",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:53.50683+00:00"
      },
      {
        "id": "7fb30fef-d13d-45b3-b58c-cd2b3e2eab5f",
        "game_player_id": "76ce2d76-d600-4109-bd7f-d7d17d0e21f3",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:53.619784+00:00"
      },
      {
        "id": "0e534e60-23e6-43e4-9f47-b955df2dc481",
        "game_player_id": "85618282-82a9-4159-b80e-8d628b99cca2",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:53.733743+00:00"
      },
      {
        "id": "c42815c4-91af-4f3f-bb3a-1d730ca254d8",
        "game_player_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:53.845426+00:00"
      },
      {
        "id": "e5957094-8e75-4371-aa9d-5dddfba43047",
        "game_player_id": "701211ca-e994-466b-8a2d-fcc6046a035c",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:53.960801+00:00"
      },
      {
        "id": "5fba4351-9c6f-40dc-bfb8-1baf05530e06",
        "game_player_id": "2d18ccbe-5723-4a29-b0c5-9ef69463a750",
        "recipient_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T14:35:54.072584+00:00"
      },
      {
        "id": "ee63e0a1-0b63-43cd-abd4-431b92c7a434",
        "game_player_id": "d21aae7d-afc6-4e69-9083-70215bd3db5d",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:06.970557+00:00"
      },
      {
        "id": "a8d65cd0-143d-4235-874b-61678f020178",
        "game_player_id": "76ce2d76-d600-4109-bd7f-d7d17d0e21f3",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:07.080542+00:00"
      },
      {
        "id": "6e123c18-d9a3-41a0-afea-98f1da6b2fa1",
        "game_player_id": "85618282-82a9-4159-b80e-8d628b99cca2",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:07.192011+00:00"
      },
      {
        "id": "306bdbbb-7060-4ded-b8d0-326bf76cc15a",
        "game_player_id": "701211ca-e994-466b-8a2d-fcc6046a035c",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:07.300754+00:00"
      },
      {
        "id": "a9e919c8-bcb1-4b1e-8ba7-481389ded865",
        "game_player_id": "2d18ccbe-5723-4a29-b0c5-9ef69463a750",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:07.412891+00:00"
      },
      {
        "id": "c01ceac8-601c-4b3b-8279-4547f5b96e6a",
        "game_player_id": "c031746e-3347-4d5d-ae65-c688749e396d",
        "recipient_id": "e101f266-81d0-4865-923b-c35733f8b7af",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T14:58:07.52217+00:00"
      }
    ],
    "synced": false
  },
  {
    "id": "4bf8198e-6938-445d-87e6-fa6ed0cc0ef6",
    "name": "17-05-26",
    "status": "waiting",
    "max_players": 8,
    "target_score": 150,
    "price_per_round": 0.1,
    "price_per_game": 0.1,
    "price_per_reentry": 0.1,
    "created_at": "2026-05-17T15:03:44.292229+00:00",
    "players": [
      {
        "id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "guest_name": "Abuela",
        "current_score": 131,
        "status": "active",
        "reentry_count": 1,
        "total_rounds_won": 0,
        "position": 1
      },
      {
        "id": "0553452d-793c-481b-a16c-66da229762dc",
        "guest_name": "Ana",
        "current_score": 40,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 2,
        "position": 2
      },
      {
        "id": "429194eb-ec14-4789-8518-367840adc1cd",
        "guest_name": "Frank",
        "current_score": 50,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 1,
        "position": 3
      },
      {
        "id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "guest_name": "Cristina",
        "current_score": 131,
        "status": "active",
        "reentry_count": 0,
        "total_rounds_won": 2,
        "position": 4
      },
      {
        "id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "guest_name": "Marc",
        "current_score": 131,
        "status": "active",
        "reentry_count": 3,
        "total_rounds_won": 0,
        "position": 5
      }
    ],
    "rounds": [
      {
        "id": "71337edf-f5d4-4f04-b32d-f8b03e418319",
        "round_number": 1,
        "winner_id": "0553452d-793c-481b-a16c-66da229762dc",
        "completed_at": "2026-05-17T15:55:18.828+00:00",
        "scores": [
          {
            "id": "8ab86b78-1c0f-49a6-9795-4195b0675f56",
            "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
            "points": 97
          },
          {
            "id": "d7e553b0-337c-4177-bb7c-c41c9ec762a7",
            "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
            "points": 0
          },
          {
            "id": "bab6f973-c093-4bce-9e12-7ad6d1563212",
            "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
            "points": 3
          },
          {
            "id": "96482de6-357f-4ff6-b702-808145d312f6",
            "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
            "points": 98
          },
          {
            "id": "734a02bf-5a3c-4f27-a5f6-8c9d81f15044",
            "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
            "points": 40
          }
        ]
      },
      {
        "id": "e88c5a6f-ea68-47c8-8aeb-823777faf278",
        "round_number": 2,
        "winner_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "completed_at": "2026-05-17T16:14:26.9+00:00",
        "scores": [
          {
            "id": "142de39b-e9c7-49c9-9a60-eaa6c3c190a6",
            "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
            "points": 2
          },
          {
            "id": "f720da3a-bbaa-40c3-8847-661a5ef4f2f3",
            "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
            "points": 5
          },
          {
            "id": "9d2ef1d0-a717-4aa2-867a-fdbd76936438",
            "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
            "points": 7
          },
          {
            "id": "896e6eab-1e6b-4cff-ad75-d6b1b22b88d9",
            "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
            "points": 0
          },
          {
            "id": "660c5747-f79e-433d-8c04-c6dfa234a078",
            "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
            "points": 17
          }
        ]
      },
      {
        "id": "835734ee-1f72-4da9-98f4-bbb734c7b5c8",
        "round_number": 3,
        "winner_id": "0553452d-793c-481b-a16c-66da229762dc",
        "completed_at": "2026-05-17T16:31:55.414+00:00",
        "scores": [
          {
            "id": "779a3fe0-e07e-4487-a266-bc629f4d42eb",
            "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
            "points": 47
          },
          {
            "id": "f723f7b6-4642-4d51-b854-6574be204953",
            "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
            "points": 0
          },
          {
            "id": "bc17c60e-3828-4d16-bdee-c20da181487a",
            "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
            "points": 37
          },
          {
            "id": "d3e06f46-f3ad-4650-98bd-fe32c468393f",
            "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
            "points": 30
          },
          {
            "id": "b9d485c9-2d14-44fd-971d-f10fdd44708b",
            "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
            "points": 106
          }
        ]
      },
      {
        "id": "98c772a8-92e4-45c1-9c79-67da9d6f5da5",
        "round_number": 4,
        "winner_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "completed_at": "2026-05-17T16:41:56.082+00:00",
        "scores": [
          {
            "id": "cbdcb38e-ded0-47d5-b55b-8f0841da8e4e",
            "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
            "points": 4
          },
          {
            "id": "3d4bd304-69d9-4ce3-9f3f-127d69d60acb",
            "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
            "points": 31
          },
          {
            "id": "bd1be9a9-5598-488f-a91c-6d2d1b4a5ea4",
            "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
            "points": 3
          },
          {
            "id": "1b97f4fc-1017-4dfe-aa5b-e5165fb27649",
            "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
            "points": 0
          },
          {
            "id": "9b89896b-0915-41e1-885c-fb8ef62c6642",
            "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
            "points": 35
          }
        ]
      },
      {
        "id": "70dfadf7-dc37-42da-958d-02ec2602ea8c",
        "round_number": 5,
        "winner_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "completed_at": "2026-05-17T17:11:13.833+00:00",
        "scores": [
          {
            "id": "d73daeff-e866-4fdd-add5-32080de5c338",
            "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
            "points": 23
          },
          {
            "id": "fc37ed7f-84a1-48c6-8ed3-1b282d5f003f",
            "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
            "points": 4
          },
          {
            "id": "a8401feb-7682-4747-bf56-66e26d1d4d51",
            "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
            "points": 0
          },
          {
            "id": "65cec70c-85aa-4f34-b198-72355fc9812a",
            "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
            "points": 3
          },
          {
            "id": "7c01b7f7-8aba-4e7f-b8b4-c96aa28ce010",
            "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
            "points": 17
          }
        ]
      }
    ],
    "transactions": [
      {
        "id": "a4665eeb-ab9b-470f-bb03-64fbee447e03",
        "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T15:55:21.8323+00:00"
      },
      {
        "id": "0f1d0ec0-8bf4-4655-badd-0cc18c02c832",
        "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T15:55:21.943536+00:00"
      },
      {
        "id": "b88193cb-2c70-42f4-a4f1-9ade4cfbc908",
        "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T15:55:22.246311+00:00"
      },
      {
        "id": "eb46f34a-e7fe-4173-a4e2-4b4385ca2288",
        "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T15:55:22.358742+00:00"
      },
      {
        "id": "ed4a6509-cc74-4583-b739-a0f1fc83ff59",
        "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T16:14:29.929482+00:00"
      },
      {
        "id": "55d7aacf-b6d6-4218-9ee1-da93b6ef4ffc",
        "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T16:14:30.044109+00:00"
      },
      {
        "id": "b81c63ae-0600-4a23-9ec2-d5b6dcba20df",
        "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T16:14:30.156158+00:00"
      },
      {
        "id": "2877deaa-5928-4f8f-a1c0-5a56370b69e1",
        "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T16:14:30.463138+00:00"
      },
      {
        "id": "0cf102dc-88ed-465f-9bf4-2c495c043aad",
        "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T16:31:58.630816+00:00"
      },
      {
        "id": "2ea1d811-c07f-4e21-9fb6-ca74437b3d86",
        "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T16:31:58.741896+00:00"
      },
      {
        "id": "934bf337-dd3a-4ee0-8efc-90bc49e90648",
        "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T16:31:59.044151+00:00"
      },
      {
        "id": "158a6a8e-5c95-4b0d-897b-34783475a2a8",
        "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "recipient_id": "0553452d-793c-481b-a16c-66da229762dc",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T16:31:59.351457+00:00"
      },
      {
        "id": "92bbe1c1-f1f5-46ad-9fdd-26605b298bbc",
        "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T16:41:58.130846+00:00"
      },
      {
        "id": "3cdd26eb-321b-468f-8806-a87d77b532a5",
        "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T16:41:58.243094+00:00"
      },
      {
        "id": "c4bdb35d-8468-47f9-a2f1-6c624a9f2eee",
        "game_player_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T16:41:58.35194+00:00"
      },
      {
        "id": "a84caf2a-4db6-4bc0-8489-bdc2ff521c36",
        "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "recipient_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T16:41:58.463543+00:00"
      },
      {
        "id": "ee33b51f-b5fb-485e-847e-0a67deefa819",
        "game_player_id": "d04676e9-3a6d-4aed-9e1b-b134f683bb30",
        "recipient_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T17:11:15.893988+00:00"
      },
      {
        "id": "cbac5fae-a804-4218-b957-8754eb2bf301",
        "game_player_id": "0553452d-793c-481b-a16c-66da229762dc",
        "recipient_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T17:11:16.0058+00:00"
      },
      {
        "id": "bcd6ade0-2b77-41fa-9f35-e9584f7feec8",
        "game_player_id": "1759f6fb-1e50-441b-9577-e3e1dc4c641a",
        "recipient_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T17:11:16.116766+00:00"
      },
      {
        "id": "841e9d9d-c685-4e71-b90b-be4c6d21335e",
        "game_player_id": "17a8b737-866f-4bf4-b7ac-c2f23a6b95e0",
        "recipient_id": "429194eb-ec14-4789-8518-367840adc1cd",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T17:11:16.230777+00:00"
      }
    ],
    "synced": false
  },
  {
    "id": "8d9d1332-0c1b-4950-a70a-e3b9fca5b2d7",
    "name": "17-05-2026",
    "status": "finished",
    "max_players": 8,
    "target_score": 149,
    "price_per_round": 0.1,
    "price_per_game": 0.1,
    "price_per_reentry": 0.1,
    "created_at": "2026-05-17T17:32:22.245999+00:00",
    "ended_at": "2026-05-17T18:49:54.911+00:00",
    "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
    "players": [
      {
        "id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "guest_name": "Abuela",
        "current_score": 245,
        "status": "eliminated",
        "reentry_count": 2,
        "total_rounds_won": 0,
        "position": 1
      },
      {
        "id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "guest_name": "Ana",
        "current_score": 126,
        "status": "winner",
        "reentry_count": 0,
        "total_rounds_won": 5,
        "position": 2
      },
      {
        "id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "guest_name": "Frank",
        "current_score": 159,
        "status": "eliminated",
        "reentry_count": 0,
        "total_rounds_won": 2,
        "position": 3
      }
    ],
    "rounds": [
      {
        "id": "21bb8632-fd06-4474-870c-6fd3d5eff0e5",
        "round_number": 1,
        "winner_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "completed_at": "2026-05-17T17:39:15.113+00:00",
        "scores": [
          {
            "id": "830e7729-e65a-4498-af20-6c60ff78ac11",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 16
          },
          {
            "id": "e787369a-dae4-483c-ad78-96484e88d6fc",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 26
          },
          {
            "id": "3231596e-0adc-46b8-a4a2-3f5b0c8ea214",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 0
          }
        ]
      },
      {
        "id": "52371604-43f0-4c57-a7ed-3df8b9e58979",
        "round_number": 2,
        "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "completed_at": "2026-05-17T17:47:26.912+00:00",
        "scores": [
          {
            "id": "97ebff7e-e0e7-49bc-ba8e-5c48f0695f2d",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 97
          },
          {
            "id": "60e2c6d3-29da-447d-b4e3-aae1864ac952",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 0
          },
          {
            "id": "c4e58e89-858d-4a5f-854e-354e8c271f07",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 96
          }
        ]
      },
      {
        "id": "5c7dbec7-eb05-4979-8d01-184063da2b73",
        "round_number": 3,
        "winner_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "completed_at": "2026-05-17T17:56:29.858+00:00",
        "scores": [
          {
            "id": "366003d2-7eaa-4474-b4cd-0cd043c21ebf",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 25
          },
          {
            "id": "24e36df5-ba40-4547-aa48-d64979064705",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 100
          },
          {
            "id": "33b98964-1d1f-4265-9e51-4819cf79a7a4",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 0
          }
        ]
      },
      {
        "id": "ae9e8b3d-593d-48d8-9e53-fd0780e1ca7a",
        "round_number": 4,
        "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "completed_at": "2026-05-17T18:07:24.21+00:00",
        "scores": [
          {
            "id": "7be23ca7-1045-4f89-abdf-348d22ec3e2f",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 86
          },
          {
            "id": "470622b9-e8a5-4272-90dd-d1571070e501",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 0
          },
          {
            "id": "1ea2d565-d4b1-459e-8959-f1b5674e1348",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 10
          }
        ]
      },
      {
        "id": "e1584a89-b9dd-4f88-8957-7f4628c16a1b",
        "round_number": 5,
        "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "completed_at": "2026-05-17T18:23:00.381+00:00",
        "scores": [
          {
            "id": "dff6183b-abb5-4a0c-9a78-befe01631a1d",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 8
          },
          {
            "id": "99e9fa6b-8e2e-488a-b06e-8afed8107bf3",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 0
          },
          {
            "id": "7b35a6f0-fabd-4d12-a54b-00e9f2e32d31",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 32
          }
        ]
      },
      {
        "id": "7b30ab43-7d28-45b2-85e2-9931a7123886",
        "round_number": 6,
        "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "completed_at": "2026-05-17T18:39:35.407+00:00",
        "scores": [
          {
            "id": "216ce559-8613-418b-912d-5119bc525975",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 100
          },
          {
            "id": "6828dd5c-17a5-48b7-80d6-a1bd2611327a",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 0
          },
          {
            "id": "9329a556-0c76-4994-909b-2f4686910e23",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 7
          }
        ]
      },
      {
        "id": "08c311f0-5426-43b7-b313-bc29f26840d3",
        "round_number": 7,
        "winner_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "completed_at": "2026-05-17T18:49:52.127+00:00",
        "scores": [
          {
            "id": "2896da39-7c2d-40c1-baed-dda993730309",
            "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
            "points": 100
          },
          {
            "id": "e456cde8-06fe-4fca-bf7e-dd7847e9aad8",
            "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
            "points": 0
          },
          {
            "id": "cda719a8-0563-4f9e-afd9-552dafca08f4",
            "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
            "points": 14
          }
        ]
      }
    ],
    "transactions": [
      {
        "id": "3c34ef93-a3d5-4cab-9ac6-59816babd4cc",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T17:39:17.66289+00:00"
      },
      {
        "id": "75625d69-fa08-47f2-a686-8e773218ab50",
        "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "recipient_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-17T17:39:17.968197+00:00"
      },
      {
        "id": "e3ef69f4-c777-4793-ac57-a0c9ba863529",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T17:47:28.904619+00:00"
      },
      {
        "id": "625545eb-c212-49b5-be24-730f38798bd4",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-17T17:47:29.018347+00:00"
      },
      {
        "id": "cdb50d5a-4b90-4529-af71-aa69870ba51f",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T17:56:32.277922+00:00"
      },
      {
        "id": "6d5b4f23-8eae-43a6-a256-b3d79fea9da5",
        "game_player_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "recipient_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-17T17:56:32.584283+00:00"
      },
      {
        "id": "5c326bd8-7923-40d9-b1af-5ce911c677d5",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T18:07:25.867771+00:00"
      },
      {
        "id": "da11c867-b73b-4651-8932-8fe2879fa422",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-17T18:07:25.980684+00:00"
      },
      {
        "id": "72b6f7d0-fcac-4017-badf-265cedd39bf2",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T18:23:02.831268+00:00"
      },
      {
        "id": "e6549264-598a-4470-9b5c-6069ba789895",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-17T18:23:02.948207+00:00"
      },
      {
        "id": "ac5767c8-89f3-4dd1-9f32-e0714cb79079",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 6,
        "created_at": "2026-05-17T18:39:37.324058+00:00"
      },
      {
        "id": "c5036a79-7857-4c8c-b7ab-0ab2dc954226",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 6,
        "created_at": "2026-05-17T18:39:37.440485+00:00"
      },
      {
        "id": "d437c892-750e-4bcb-a538-26841c8ab95f",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 7,
        "created_at": "2026-05-17T18:49:54.162074+00:00"
      },
      {
        "id": "54c07a50-4c4a-4502-8e80-a2133d52af54",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 7,
        "created_at": "2026-05-17T18:49:54.274897+00:00"
      },
      {
        "id": "276678d7-d8fe-44b9-a318-9ee05c7a6cd1",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-17T18:49:55.198947+00:00"
      },
      {
        "id": "c0e59f98-dc75-4b53-9275-c84169719f72",
        "game_player_id": "cf42f2fa-9f7d-43a6-9719-e4686c2c42b0",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "reentry_payment",
        "amount": 0.2,
        "created_at": "2026-05-17T18:49:55.318699+00:00"
      },
      {
        "id": "0d80319b-0fe4-4c29-8f52-316d81fa07d5",
        "game_player_id": "0b8632f1-602a-47a0-89f6-749f94cf9701",
        "recipient_id": "adde377e-49f3-4cc1-9625-bf26456b0758",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-17T18:49:55.429642+00:00"
      }
    ],
    "synced": false
  },
  {
    "id": "851793ea-6ecd-4163-81e6-4b1704c6d906",
    "name": "24-04-26",
    "status": "finished",
    "max_players": 3,
    "target_score": 150,
    "price_per_round": 0.1,
    "price_per_game": 0.1,
    "price_per_reentry": 0.1,
    "created_at": "2026-05-24 14:24:59",
    "ended_at": "2026-05-24T15:35:47.096Z",
    "winner_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
    "players": [
      {
        "id": "94883195-2eda-4576-ab45-27b6543764fd",
        "guest_name": "Abuela",
        "current_score": 162,
        "status": "eliminated",
        "reentry_count": 1,
        "total_rounds_won": 0,
        "position": 1
      },
      {
        "id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "guest_name": "Ana",
        "current_score": 98,
        "status": "winner",
        "reentry_count": 0,
        "total_rounds_won": 2,
        "position": 2
      },
      {
        "id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "guest_name": "Frank",
        "current_score": 201,
        "status": "eliminated",
        "reentry_count": 0,
        "total_rounds_won": 2,
        "position": 3
      }
    ],
    "rounds": [
      {
        "id": "4523f022-5407-40e0-99f3-e17477b613cd",
        "round_number": 1,
        "winner_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "completed_at": "2026-05-24T14:45:54.238Z",
        "scores": [
          {
            "id": "20c49897-efc7-42cf-9442-04587b0d1188",
            "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
            "points": 33
          },
          {
            "id": "68e0b9dc-a1ca-4e8d-864e-5aa30a1b45a4",
            "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
            "points": 96
          },
          {
            "id": "66c35cd9-b3c0-4e8f-a0d6-1edc1c76cab2",
            "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
            "points": 0
          }
        ]
      },
      {
        "id": "bceca006-a63e-45d5-b20c-849150cc1bc3",
        "round_number": 2,
        "winner_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "completed_at": "2026-05-24T15:09:42.508Z",
        "scores": [
          {
            "id": "3c13e9ad-e775-4bd0-99e3-832889a51be0",
            "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
            "points": 113
          },
          {
            "id": "11659f27-bd80-4e29-a788-e7aa3612029e",
            "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
            "points": 2
          },
          {
            "id": "7d4bba39-93f9-4133-8706-2675f71f39e9",
            "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
            "points": 0
          }
        ]
      },
      {
        "id": "e48378a2-f540-4462-8ac8-41394da240be",
        "round_number": 3,
        "winner_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "completed_at": "2026-05-24T15:22:48.768Z",
        "scores": [
          {
            "id": "d7a6f1fe-b95a-476f-86cf-9eea53fb15ea",
            "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
            "points": 9
          },
          {
            "id": "ef97e2cd-1f9e-4dc3-8e2e-ae18defdf6c3",
            "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
            "points": 0
          },
          {
            "id": "bb311d06-829c-412b-a6ac-c783618cee08",
            "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
            "points": 98
          }
        ]
      },
      {
        "id": "18f7b1cc-d674-4466-80b8-5675f4701a33",
        "round_number": 4,
        "winner_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "completed_at": "2026-05-24T15:35:46.964Z",
        "scores": [
          {
            "id": "51f9e043-caff-4fcd-ae89-99faa9e5912d",
            "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
            "points": 64
          },
          {
            "id": "cd41a922-9dfe-498a-a7e7-c67630cc21b2",
            "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
            "points": 0
          },
          {
            "id": "fc07bef4-4734-4221-aae6-5b525c71d765",
            "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
            "points": 103
          }
        ]
      }
    ],
    "transactions": [
      {
        "id": "fed74b20-20f7-4960-98d1-c2461d70276b",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-24 14:45:54"
      },
      {
        "id": "93a5c5f4-6005-47db-b3de-efab4854d49b",
        "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "recipient_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-24 14:45:54"
      },
      {
        "id": "76c18e6d-496d-46c7-a9fd-cabe1a446982",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-24 15:09:42"
      },
      {
        "id": "d64159d5-8080-4528-88e9-6bd952438416",
        "game_player_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "recipient_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-24 15:09:42"
      },
      {
        "id": "1b910e30-af6a-4445-be63-cea7248e2922",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-24 15:22:48"
      },
      {
        "id": "9494ae54-26d9-48de-a1dd-eb7752723ee0",
        "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-24 15:22:48"
      },
      {
        "id": "f8c2b408-e6fc-4b28-bdd1-31315aaab619",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-24 15:35:47"
      },
      {
        "id": "ae5b93a9-426a-4a71-acbc-a8eabb67f1da",
        "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-24 15:35:47"
      },
      {
        "id": "6aa3f803-826f-4b69-b1f1-7fdf8b5c1c24",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 15:35:47"
      },
      {
        "id": "afcfdeb9-3fe7-4990-9f9f-cad3f3661b4c",
        "game_player_id": "94883195-2eda-4576-ab45-27b6543764fd",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "reentry_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 15:35:47"
      },
      {
        "id": "3136dbf8-81b4-475e-8ed4-66b8eb7d41d1",
        "game_player_id": "27a6b84b-51a6-4151-96fa-7f0507faf7e8",
        "recipient_id": "bdb72a71-d1b2-41a4-8e8f-5a754a8a0303",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 15:35:47"
      }
    ],
    "synced": false
  },
  {
    "id": "951aeb24-d7ea-4924-809f-9b3d12caf2b2",
    "name": "24-05-26",
    "status": "finished",
    "max_players": 3,
    "target_score": 150,
    "price_per_round": 0.1,
    "price_per_game": 0.1,
    "price_per_reentry": 0.1,
    "created_at": "2026-05-24 15:40:00",
    "ended_at": "2026-05-24T18:31:39.769Z",
    "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
    "players": [
      {
        "id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "guest_name": "Abuela",
        "current_score": 240,
        "status": "eliminated",
        "reentry_count": 1,
        "total_rounds_won": 2,
        "position": 1
      },
      {
        "id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "guest_name": "Ana",
        "current_score": 47,
        "status": "winner",
        "reentry_count": 0,
        "total_rounds_won": 7,
        "position": 2
      },
      {
        "id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "guest_name": "Frank",
        "current_score": 247,
        "status": "eliminated",
        "reentry_count": 1,
        "total_rounds_won": 2,
        "position": 3
      }
    ],
    "rounds": [
      {
        "id": "eb52f0b4-d6d9-4ca0-a1b2-de13c2f0c621",
        "round_number": 1,
        "winner_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "completed_at": "2026-05-24T16:02:16.419Z",
        "scores": [
          {
            "id": "a2346a3f-f4ac-4130-bd7c-5fd2388b8e2b",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 94
          },
          {
            "id": "fe19a8f2-29e7-42f0-ada9-9430318abbf6",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 8
          },
          {
            "id": "34178a23-2597-41fc-9231-e661c1de3f2a",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 0
          }
        ]
      },
      {
        "id": "41ba9e3d-5483-4959-b94f-78ba1b3b4554",
        "round_number": 2,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T16:17:13.203Z",
        "scores": [
          {
            "id": "57d8cd8c-0b08-488a-a429-8a5014f9c89c",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 20
          },
          {
            "id": "c969405c-04ee-4358-9d80-ac848ace4647",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "c8079f6d-57c1-4dd8-bf15-9b9814c70a94",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 28
          }
        ]
      },
      {
        "id": "6075f59e-fb6c-4a16-b127-b64cfb47cceb",
        "round_number": 3,
        "winner_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "completed_at": "2026-05-24T16:32:47.012Z",
        "scores": [
          {
            "id": "eb82840b-6541-4f3f-ae0d-7e731604866c",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 0
          },
          {
            "id": "8efe9374-b074-4406-9551-bba43c77c706",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 19
          },
          {
            "id": "2e440e72-12dc-468a-8fd2-8e2348255f5e",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 15
          }
        ]
      },
      {
        "id": "30df01ed-49b2-4c2b-8b3b-1e3cffbc924f",
        "round_number": 4,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T16:58:20.432Z",
        "scores": [
          {
            "id": "b571f19f-9230-4662-8594-dee0f4a0f2cc",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 26
          },
          {
            "id": "fac590eb-4711-4901-907c-bfdb4fc40fab",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "3e05b57b-efd3-4e5b-adee-3361fe3d40bf",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 16
          }
        ]
      },
      {
        "id": "dc09d01a-da77-4b1a-b2a7-dae67ca5b937",
        "round_number": 5,
        "winner_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "completed_at": "2026-05-24T17:11:09.444Z",
        "scores": [
          {
            "id": "e3b65c24-c883-4971-9e94-79a205f24148",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 24
          },
          {
            "id": "e7242c58-b614-45de-b4f4-5458a274267c",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 3
          },
          {
            "id": "f761c1d5-d189-46eb-be13-e5137a6e5d2a",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 0
          }
        ]
      },
      {
        "id": "bbda251e-c253-4c31-89e6-29205d1cdb25",
        "round_number": 6,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T17:23:56.002Z",
        "scores": [
          {
            "id": "2bc68c90-cffe-4e0e-a431-1f63b12bc111",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 10
          },
          {
            "id": "f6b4164c-6b57-483f-89f5-0b4fdcd75354",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "23b169d4-3920-4299-80a7-0e932c520466",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 18
          }
        ]
      },
      {
        "id": "f5d1e941-d42b-43ee-901b-92d6af0c0880",
        "round_number": 7,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T17:33:54.903Z",
        "scores": [
          {
            "id": "e0090999-d148-4d59-8daa-45f51b38b27d",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 39
          },
          {
            "id": "c86fc25f-e83a-4968-b778-9b7b62c7a868",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "4e2eb6cf-fd32-43be-a10a-9dd450850b76",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 49
          }
        ]
      },
      {
        "id": "fce40c4f-55b9-4df9-8ed7-08cbde3b9a3e",
        "round_number": 8,
        "winner_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "completed_at": "2026-05-24T17:45:55.053Z",
        "scores": [
          {
            "id": "3b3742f1-aebb-4d2b-accf-07d79334b162",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 0
          },
          {
            "id": "2436c38b-9be5-4485-b4a7-24c07c254c52",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 17
          },
          {
            "id": "cd8084fb-ad9d-4c2e-a8ff-6c51e3bbe8c1",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 8
          }
        ]
      },
      {
        "id": "aad1b28f-3264-4419-9cc6-4e2dcf9cc746",
        "round_number": 9,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T18:05:50.974Z",
        "scores": [
          {
            "id": "622cf013-6df4-439d-8494-7f4f3449f96e",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 13
          },
          {
            "id": "6bd2d8a7-d320-4bc8-8784-88f4d3bfc987",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "b6f491a8-edb8-4be1-b50b-a77f25a2f351",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 44
          }
        ]
      },
      {
        "id": "d55828b2-a465-45f9-8f1a-654a447faf80",
        "round_number": 10,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T18:20:19.557Z",
        "scores": [
          {
            "id": "2286019c-f72b-44ca-bc7b-2b420681cfe6",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 19
          },
          {
            "id": "17f4115e-90bb-4a64-8b1c-bfe67c13081d",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "7009a4d8-7b55-4826-882e-8b55bac63340",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 26
          }
        ]
      },
      {
        "id": "b26b7e58-6af2-4836-9472-0ab2cf56b204",
        "round_number": 11,
        "winner_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "completed_at": "2026-05-24T18:31:39.653Z",
        "scores": [
          {
            "id": "3059c7d1-0bb1-47cf-a5f2-d7c7896cc8be",
            "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
            "points": 100
          },
          {
            "id": "55e63a9d-3f3c-47f2-9b01-61c47eb4b143",
            "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
            "points": 0
          },
          {
            "id": "6bb2c631-9218-4a06-bff1-1689e4f02cb4",
            "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
            "points": 100
          }
        ]
      }
    ],
    "transactions": [
      {
        "id": "1404ed21-6d6d-4d16-8b21-a6b37fb49e66",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-24 16:02:16"
      },
      {
        "id": "37129bcd-1623-4ecf-a8b1-f9fdfeba5f47",
        "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "recipient_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 1,
        "created_at": "2026-05-24 16:02:16"
      },
      {
        "id": "efce91b8-d29e-45b4-9cc6-4339fbe5dd42",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-24 16:17:13"
      },
      {
        "id": "ed72e7e1-789e-4135-8926-4abac0336be5",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 2,
        "created_at": "2026-05-24 16:17:13"
      },
      {
        "id": "36efd0d9-00c9-4b96-9fe0-bc7a9a3329c1",
        "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "recipient_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-24 16:32:47"
      },
      {
        "id": "d90ec993-fee7-46d2-86af-c687cd121b75",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 3,
        "created_at": "2026-05-24 16:32:47"
      },
      {
        "id": "4b53e9f9-f27e-49a2-84bd-c37f6a54c480",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-24 16:58:20"
      },
      {
        "id": "6a4253ef-5795-42ca-bf15-16245fe5d865",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 4,
        "created_at": "2026-05-24 16:58:20"
      },
      {
        "id": "89891aa5-0219-41fe-8967-470bad46db7d",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-24 17:11:09"
      },
      {
        "id": "fd0e785f-963a-4120-9f61-56f889ee4a53",
        "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "recipient_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 5,
        "created_at": "2026-05-24 17:11:09"
      },
      {
        "id": "44318bd3-0c39-4ffb-a63f-b5aceda0818e",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 6,
        "created_at": "2026-05-24 17:23:56"
      },
      {
        "id": "131da59a-6c39-4b90-a609-0f7160fd3cd7",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 6,
        "created_at": "2026-05-24 17:23:56"
      },
      {
        "id": "433e7d38-c8f7-4069-bb23-3e3513e3ca8a",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 7,
        "created_at": "2026-05-24 17:33:54"
      },
      {
        "id": "898c61d4-fd32-49ae-bcae-821d6e7d1f41",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 7,
        "created_at": "2026-05-24 17:33:54"
      },
      {
        "id": "80c21386-217e-45fc-8621-581d7f7cecca",
        "game_player_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "recipient_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 8,
        "created_at": "2026-05-24 17:45:55"
      },
      {
        "id": "3f66c14f-86cb-4072-800d-611394fe987a",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 8,
        "created_at": "2026-05-24 17:45:55"
      },
      {
        "id": "4c347a1c-fa8e-4edb-a648-f0d047c91579",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 9,
        "created_at": "2026-05-24 18:05:51"
      },
      {
        "id": "61e7e4e7-18d3-4ced-9092-53a9456be82e",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 9,
        "created_at": "2026-05-24 18:05:51"
      },
      {
        "id": "5c058060-5e91-46ab-9bb9-2de75ac6b9c1",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 10,
        "created_at": "2026-05-24 18:20:19"
      },
      {
        "id": "c729abb6-78c9-4786-90c7-4697579977ac",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 10,
        "created_at": "2026-05-24 18:20:19"
      },
      {
        "id": "23796088-108a-4bb6-a9bd-b634da1482ef",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 11,
        "created_at": "2026-05-24 18:31:39"
      },
      {
        "id": "977066c2-c2e2-44c9-8f7a-b7c34b552a3d",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "round_payment",
        "amount": 0.1,
        "round_number": 11,
        "created_at": "2026-05-24 18:31:39"
      },
      {
        "id": "2687d6f6-36fb-4494-b8fc-360acfb46d27",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 18:31:39"
      },
      {
        "id": "748d76b3-300e-48a7-803e-be113414a373",
        "game_player_id": "f695ae61-b27c-411a-be1b-0afd4e705e83",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "reentry_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 18:31:39"
      },
      {
        "id": "2016be01-499c-4fdd-9b5c-538bfc187d4b",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "game_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 18:31:39"
      },
      {
        "id": "949c1880-6172-4baf-88c4-a1fda00ec7c5",
        "game_player_id": "5ef40d21-6328-484c-a0cd-aeeb667beb65",
        "recipient_id": "d872a7ad-740a-432e-af2c-69b6919eabdf",
        "type": "reentry_payment",
        "amount": 0.1,
        "created_at": "2026-05-24 18:31:39"
      }
    ],
    "synced": false
  }
];
