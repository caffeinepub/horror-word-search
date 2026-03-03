import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  type GameSession = Principal;
  type CategoryName = Text;

  type Category = {
    name : CategoryName;
    words : [Text];
  };

  type PuzzleTime = {
    sessionId : GameSession;
    timeTaken : Time.Time; // nanoseconds
    timestamp : Time.Time; // completion timestamp
  };

  module PuzzleTime {
    public func compare(time1 : PuzzleTime, time2 : PuzzleTime) : Order.Order {
      Int.compare(time1.timeTaken, time2.timeTaken);
    };
  };

  // Persistent data structures
  let puzzles = Map.empty<CategoryName, Category>();
  let bestTimes = Map.empty<CategoryName, List.List<PuzzleTime>>();

  // Preloaded horror movie categories and words
  let categories = [
    {
      name = "Classic Horror";
      words = [
        "Dracula",
        "Frankenstein",
        "Nosferatu",
        "Poltergeist",
        "The Shining",
        "Rosemary",
        "Omen",
        "Exorcist",
        "Suspiria",
      ];
    },
    {
      name = "Slasher Films";
      words = [
        "Halloween",
        "Freddy",
        "Jason",
        "Chucky",
        "Scream",
        "Carrie",
        "Psycho",
        "Nightmare",
      ];
    },
    {
      name = "Supernatural Horror";
      words = [
        "Conjuring",
        "Annabelle",
        "Hereditary",
        "Midsommar",
        "Sinister",
        "Insidious",
        "Hellraiser",
        "Candyman",
      ];
    },
    {
      name = "Horror Icons";
      words = [
        "Freddy",
        "Jason",
        "Michael",
        "Leatherface",
        "Pinhead",
        "Samara",
        "Pennywise",
      ];
    },
  ];

  // Initialize categories at deployment
  public shared ({ caller }) func init() : async () {
    for (category in categories.values()) {
      puzzles.add(category.name, category);
    };
  };

  public query ({ caller }) func getPuzzle(categoryName : CategoryName) : async Category {
    switch (puzzles.get(categoryName)) {
      case (null) {
        Runtime.trap("Category not found");
      };
      case (?category) {
        category;
      };
    };
  };

  public shared ({ caller }) func submitPuzzleTime(categoryName : CategoryName, timeTaken : Time.Time) : async () {
    if (timeTaken <= 0) { Runtime.trap("Invalid time: Time must be greater than zero.") };

    let puzzleTime : PuzzleTime = {
      sessionId = caller;
      timeTaken;
      timestamp = Time.now();
    };

    let existingTimes = switch (bestTimes.get(categoryName)) {
      case (null) {
        let newList = List.empty<PuzzleTime>();
        newList.add(puzzleTime);
        newList;
      };
      case (?times) {
        times.add(puzzleTime);
        times;
      };
    };

    bestTimes.add(categoryName, existingTimes);
  };

  public query ({ caller }) func getLeaderboard(categoryName : CategoryName) : async [PuzzleTime] {
    switch (bestTimes.get(categoryName)) {
      case (null) { []; };
      case (?times) {
        times.toArray().sort();
      };
    };
  };

  public query ({ caller }) func getCategories() : async [CategoryName] {
    puzzles.keys().toArray();
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    puzzles.values().toArray();
  };
};
