import { LessonStep } from "../types";

export const lessonSteps: LessonStep[] = [
  {
    "id": "multi_select_example",
    "message": "תסמנו את הנרות שמצביעים על עלייה",
    "backgroundImage": "bg3",
    "activity": "multiSelect",
    "activityConfig": {
      "submitText": "אישור",
      "layout": "grid",
      "options": [
        {
          "id": "opt_1",
          "label": "1",
          "correct": true,
          "imageKey": "character_yellow_blue.png"
        },
        {
          "id": "opt_2",
          "label": "2",
          "correct": true,
          "imageKey": "character_green_blue.png"
        },
        {
          "id": "opt_3",
          "label": "3",
          "correct": false,
          "imageKey": "character_orange_blue.png"
        },
        {
          "id": "opt_4",
          "label": "4",
          "correct": false,
          "imageKey": "character_green_yellow.png"
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
    "message": "בדיקה",
    "backgroundImage": "bg5",
    "activity": "carouselSelect",
    "activityConfig": {
      "carousel": {
        "items": [
          {
            "id": "item_1",
            "label": "1",
            "imageKey": "character_orange_blue.png"
          },
          {
            "id": "item_2",
            "label": "2",
            "imageKey": "character_blue_white.png"
          },
          {
            "id": "item_3",
            "label": "3",
            "imageKey": "character_orange_blue.png"
          }
        ],
        "correctId": "item_3",
        "submitText": "המשך"
      }
    },
    "choices": [
      {
        "text": "Next",
        "nextStep": "map"
      }
    ]
  }
];
