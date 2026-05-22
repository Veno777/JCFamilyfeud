export interface Answer {
  text: string;
  points: number;
}

export interface Round {
  question: string;
  answers: (Answer | null)[];
}

export interface Game {
  rounds: Round[];
}

export interface Category {
  name: string;
  games: Game[];
}

export const gameData: Category[] = [
  {
    name: "Sports",
    games: [
      {
        rounds: [
          {
            question: "Name the greatest athlete of all time across any sport.",
            answers: [
              { text: "Lionel Messi", points: 20 },
              { text: "Michael Jordan", points: 17 },
              { text: "LeBron James", points: 13 },
              { text: "Tom Brady", points: 11 },
              { text: "Novak Djokovic", points: 11 },
              { text: "Tiger Woods", points: 10 },
              { text: "Wayne Gretzky", points: 10 },
              { text: "Serena Williams", points: 8 },
            ],
          },
          {
            question: "Name the greatest sports dynasties of all time.",
            answers: [
              { text: "Chicago Bulls (1991–1998)", points: 20 },
              { text: "Golden State Warriors (2015–2019)", points: 15 },
              { text: "New England Patriots (2014–2018)", points: 15 },
              { text: "Real Madrid (2016–2018)", points: 13 },
              { text: "Kansas City Chiefs (2022–2024)", points: 13 },
              { text: "Montreal Canadiens (1976–1979)", points: 12 },
              { text: "New York Yankees (1998–2000)", points: 12 },
              null,
            ],
          },
          {
            question: "Name something you would yell at your TV during a sports game.",
            answers: [
              { text: "LET'S GOOO!", points: 24 },
              { text: "BAD CALL REF", points: 17 },
              { text: "ARE YOU SERIOUS?!", points: 13 },
              { text: "I COULD'VE MADE THAT!", points: 12 },
              { text: "PARLAY", points: 10 },
              { text: "PASS THE BALL!", points: 8 },
              { text: "I'M TURNING THIS OFF!", points: 8 },
              null,
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Food",
    games: [
      {
        rounds: [
          {
            question: "Name a food topping people usually take off their food.",
            answers: [
              { text: "Pickles", points: 22 },
              { text: "Tomatoes", points: 18 },
              { text: "Onions", points: 16 },
              { text: "Olives", points: 14 },
              { text: "Lettuce", points: 10 },
              { text: "Mushrooms", points: 10 },
              { text: "Jalapeños", points: 10 },
              null,
            ],
          },
          {
            question: "Name the best food or drink when hungover.",
            answers: [
              { text: "Greasy breakfast (bacon/eggs/hash browns)", points: 25 },
              { text: "Fast food (McDonald's / burger & fries)", points: 20 },
              { text: "Pizza", points: 15 },
              { text: "A beer", points: 13 },
              { text: "Ramen / noodles", points: 10 },
              { text: "Gatorade / electrolyte drinks", points: 9 },
              { text: "Plain carbs (toast / crackers / bread)", points: 8 },
              null,
            ],
          },
          {
            question: "Name a popular choice for a last meal on death row.",
            answers: [
              { text: "Steak (with sides)", points: 22 },
              { text: "Pizza", points: 18 },
              { text: "Burger & fries", points: 16 },
              { text: "Fried chicken", points: 14 },
              { text: "Ice cream / dessert", points: 10 },
              { text: "Pasta (spaghetti / Alfredo)", points: 10 },
              { text: "BBQ ribs / wings", points: 10 },
              null,
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Justin",
    games: [
      {
        rounds: [
          {
            question: "Justin's top celebrity crushes.",
            answers: [
              { text: "Kendall Jenner", points: 18 },
              { text: "Selena Gomez", points: 16 },
              { text: "Margot Robbie", points: 14 },
              { text: "Zendaya", points: 13 },
              { text: "Kim Kardashian", points: 12 },
              { text: "Megan Fox", points: 10 },
              { text: "Angelina Jolie", points: 7 },
              null,
            ],
          },
          {
            question: "Justin's favourite music artists.",
            answers: [
              { text: "Drake", points: 20 },
              { text: "Travis Scott", points: 17 },
              { text: "Kanye West", points: 15 },
              { text: "Frank Ocean", points: 12 },
              { text: "Chris Brown", points: 10 },
              { text: "Jay-Z", points: 9 },
              { text: "Justin Bieber", points: 7 },
              null,
            ],
          },
          {
            question: "Rank Justin's favourite apps/sites (most to least used).",
            answers: [
              { text: "YouTube", points: 20 },
              { text: "Instagram", points: 18 },
              { text: "WhatsApp", points: 16 },
              { text: "Netflix", points: 14 },
              { text: "Spotify", points: 12 },
              { text: "ESPN", points: 10 },
              { text: "TikTok", points: 10 },
              null,
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Family Feud",
    games: [
      {
        rounds: [
          {
            question: "Name something people are afraid of.",
            answers: [
              { text: "Spiders", points: 28 },
              { text: "Snakes", points: 22 },
              { text: "Heights", points: 20 },
              { text: "Death", points: 12 },
              { text: "Flying", points: 10 },
              { text: "The dark", points: 8 },
              null,
            ],
          },
          {
            question: "Name something people bring to the beach.",
            answers: [
              { text: "Towel", points: 30 },
              { text: "Sunscreen", points: 22 },
              { text: "Chair", points: 18 },
              { text: "Cooler", points: 14 },
              { text: "Umbrella", points: 10 },
              { text: "Food/snacks", points: 6 },
              null,
            ],
          },
          {
            question: "Name a popular ice cream flavor.",
            answers: [
              { text: "Vanilla", points: 45 },
              { text: "Chocolate", points: 42 },
              { text: "Strawberry", points: 21 },
              { text: "Cookies & cream", points: 18 },
              { text: "Mint", points: 15 },
              { text: "Cookie dough", points: 9 },
              null,
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Common Knowledge",
    games: [
      {
        rounds: [
          {
            question: "Name something you find in every household.",
            answers: [
              { text: "TV", points: 32 },
              { text: "Couch / sofa", points: 24 },
              { text: "Refrigerator", points: 18 },
              { text: "Bed", points: 12 },
              { text: "Phone", points: 9 },
              { text: "Keys", points: 5 },
              null,
            ],
          },
          {
            question: "Name a reason someone would call in sick to work.",
            answers: [
              { text: "Hangover", points: 30 },
              { text: "Cold / flu", points: 26 },
              { text: "Mental health day", points: 18 },
              { text: "Family emergency", points: 13 },
              { text: "Stomach bug", points: 8 },
              { text: "Tired / exhausted", points: 5 },
              null,
            ],
          },
          {
            question: "Name something people lie about on a first date.",
            answers: [
              { text: "Their job / salary", points: 35 },
              { text: "Their age", points: 28 },
              { text: "How many people they've dated", points: 18 },
              { text: "Their interests / hobbies", points: 10 },
              { text: "Living situation", points: 6 },
              { text: "Their height", points: 3 },
              null,
            ],
          },
        ],
      },
    ],
  },
];
