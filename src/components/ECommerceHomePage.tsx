import React, { useState, useEffect, Suspense } from "react";
import Joyride, { CallBackProps, STATUS, STATUS as JoyrideStatus } from 'react-joyride';
import Header from './Header';
import CategorySection from './CategorySection';
import NewItemsSection from './NewItemsSection';
import Footer from './Footer';
import styles from './ECommerceHomePage.module.css';
import { Bubble } from "@typebot.io/react";

const ECommerceHomePage: React.FC = () => {
  const tourSteps = [
    {
      target: '[data-tour-id="search"]',
      content: 'Search for items here!',
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="category"]',
      content: 'Explore products by category here.',
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="saved-items"]',
      content: 'Access your saved items and cart here.',
      disableBeacon: true,
    },
    {
      target: '[data-tour-id="review-step"]',
      content: 'Check seller ratings and reviews here!',
      disableBeacon: true,
    },
  ];
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [runTour, setRunTour] = useState(false);
  const [showTourPrompt, setShowTourPrompt] = useState(false);

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(selectedSubcategory === subcategory ? undefined : subcategory);
  };

  useEffect(() => {
    const shouldShow = localStorage.getItem("showTour") === "true";
    if (shouldShow) {
      setShowTourPrompt(true);
    }
  }, []);


  return (
    <div className={styles.eCommerceHomePage}>
      <Joyride
        key={runTour ? "tour-running" : "tour-stopped"}
        steps={tourSteps}
        run={runTour}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        styles={{
          options: {
            primaryColor: '#C75F96',
            zIndex: 9999,
          },
        }}
        callback={(data: CallBackProps) => {
          const finishedStatuses: string[] = [JoyrideStatus.FINISHED, JoyrideStatus.SKIPPED];
          if (finishedStatuses.includes(data.status)) {
            localStorage.setItem("showTour", "false");
            setRunTour(false);
            setShowTourPrompt(false);
          }
        }}
      />

      {/* Prompt for user to start or skip tour */}
      {showTourPrompt && (
        <div className={styles.tourPrompt}>
          <p>Welcome to DealSpot! Would you like a quick tour?</p>
          <button onClick={() => {
            setShowTourPrompt(false);
            setTimeout(() => setRunTour(true), 200); // Delay --> for allowing time to render--> don't remove
          }}>Start Tour</button>
          <button onClick={() => {
            setShowTourPrompt(false);
            localStorage.setItem("showTour", "false");
          }}>Skip</button>
        </div>
      )}

      <Header setSearchQuery={setSearchQuery} />
      <div className={styles.divider} />
      <div className={styles.mainContent}>
        <CategorySection onSubcategorySelect={handleSubcategorySelect} />
        <NewItemsSection 
          subcategory={selectedSubcategory} 
          searchQuery={searchQuery}
        />
      </div>
      <Footer />
      <div data-tour-id="chatbot"></div>
      <Suspense fallback={<div>Loading chatbot...</div>}>
        <Bubble
          data-tour-id="chatbot"
          typebot="product-recommendation-4mpbiwj"
          apiHost="https://typebot.io"
          theme={{ button: { backgroundColor: "#C75F96" } }}
        />
      </Suspense>
    </div>
  );
};

export default ECommerceHomePage;
