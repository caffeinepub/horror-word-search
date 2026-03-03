import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CategoryScreen from "./components/CategoryScreen";
import GameScreen from "./components/GameScreen";
import { useActor } from "./hooks/useActor";

type Screen = "categories" | "game";

function App() {
  const [screen, setScreen] = useState<Screen>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { actor } = useActor();

  // Init backend once on load
  useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      if (!actor) return null;
      await actor.init();
      return true;
    },
    enabled: !!actor,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  // Update page title
  useEffect(() => {
    document.title = "Horror Word Search — Find the Hidden Horrors";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute(
        "content",
        "A spine-chilling word search game for horror movie lovers. Find hidden words across terrifying categories.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "A spine-chilling word search game for horror movie lovers. Find hidden words across terrifying categories.";
      document.head.appendChild(meta);
    }
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setScreen("game");
  };

  const handleBackToCategories = () => {
    setScreen("categories");
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {screen === "categories" && (
        <CategoryScreen onCategorySelect={handleCategorySelect} />
      )}
      {screen === "game" && selectedCategory && (
        <GameScreen
          categoryName={selectedCategory}
          onBack={handleBackToCategories}
          onChangeCategory={handleBackToCategories}
        />
      )}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.13 0.015 20)",
            border: "1px solid oklch(0.52 0.22 22 / 0.5)",
            color: "oklch(0.88 0.02 50)",
          },
        }}
      />
    </div>
  );
}

export default App;
