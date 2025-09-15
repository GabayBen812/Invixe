import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    "id": "multi_select_example",
    "message": "TTT",
    "backgroundImage": "bg2",
    "activity": "multiSelect",
    "activityConfig": {
      "submitText": "Check Answer",
      "layout": "grid",
      "options": [
        {
          "id": "opt_1",
          "label": "1",
          "correct": false,
          "imageKey": "character_green_orange.png"
        },
        {
          "id": "opt_2",
          "label": "2",
          "correct": true,
          "imageKey": "character_green_orange.png"
        },
        {
          "id": "opt_3",
          "label": "3",
          "correct": true,
          "imageKey": "character_yellow_white.png"
        },
        {
          "id": "opt_4",
          "label": "4",
          "correct": false,
          "imageKey": "character_yellow_white.png"
        }
      ]
    },
    "choices": [
      {
        "text": "Next",
        "nextStep": "carousel_select"
      }
    ]
  },
  {
    "id": "carousel_select",
    "message": "tttt",
    "backgroundImage": "bg3",
    "activity": "carouselSelect",
    "activityConfig": {
      "carousel": {
        "items": [
          {
            "id": "item_1",
            "label": "1",
            "imageKey": "character_yellow_white.png"
          },
          {
            "id": "item_2",
            "label": "2",
            "imageKey": "character_yellow_blue.png"
          }
        ],
        "correctId": "item_2",
        "submitText": "Confirm"
      }
    },
    "choices": [
      {
        "text": "Next",
        "nextStep": ""
      }
    ]
  }
];
