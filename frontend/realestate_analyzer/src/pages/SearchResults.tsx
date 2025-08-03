import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ServerCrash } from "lucide-react";
import Header from "../components/Header";
import AuthModal from "../components/AuthModal";
import PropertyCard from "../components/PropertyCard";

// =================================================================
// ## 1. DEFINING TYPES FOR OUR BACKEND DATA
// =================================================================
interface Property {
  link: string;
  area_m2: number;
  building_age: number;
  room_count: number;
  total_price_toman?: number;
  price_per_m2_toman?: number;
  deposit_toman?: number;
  monthly_rent_toman?: number;
}

interface ApiResults {
  city: string;
  sales_properties: Property[];
  rentals_properties: Property[];
}

interface SearchResultsProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function SearchResults({
  isDark,
  toggleTheme,
}: SearchResultsProps) {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ApiResults | null>(null);

  const city = searchParams.get("city") || "";
  const showRent = searchParams.get("rent") === "true";
  const showSale = searchParams.get("sale") === "true";

  // Modal state (simplified)
  const [showModal, setShowModal] = React.useState(false);

  // =================================================================
  // ## 2. FETCHING REAL DATA FROM THE DJANGO API
  // =================================================================

  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      if (!city) {
        setError("No city provided in the search.");
        setIsLoading(false);
        return;
      }

      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `http://127.0.0.1:8000/api/get-data/${city}/`
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || "Failed to fetch data from the server."
            );
          }
          const data: ApiResults = await response.json();
          setResults(data);
        } catch (err: any) {
          setError(err.message || "Could not connect to the backend.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
      return () => {
        effectRan.current = true;
      };
    }
  }, [city]); // This effect runs whenever the 'city' in the URL changes

  // Modal handlers (simplified)
  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  // Determine which sections to show
  const sectionsToShow = [];
  if (!showRent && !showSale) {
    sectionsToShow.push("sale", "rent");
  } else {
    if (showSale) sectionsToShow.push("sale");
    if (showRent) sectionsToShow.push("rent");
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        handleModalOpen={handleModalOpen}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-center">
                Loading Properties for {city}...
              </h2>
              <p className="text-center mt-2 text-gray-400">
                Our AI is analyzing the best properties for you.
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <ServerCrash size={48} className="text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-red-400">
                An Error Occurred
              </h2>
              <p className="text-gray-400 mt-2">{error}</p>
            </div>
          )}

          {/* ================================================================= */}
          {/* ## 3. DISPLAYING THE FETCHED DATA                                */}
          {/* ================================================================= */}
          {!isLoading && !error && results && (
            <>
              <div className="mb-12">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                  Search Results
                </h1>
                <p className="text-lg text-gray-400">
                  Showing top AI-selected properties in {results.city}
                </p>
              </div>

              {sectionsToShow.includes("sale") && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">
                    Properties for Sale
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {results.sales_properties.map((property, index) => (
                      <PropertyCard
                        key={`sale-${index}`}
                        property={property}
                        isDark={isDark}
                        type="sale"
                      />
                    ))}
                  </div>
                </section>
              )}

              {sectionsToShow.includes("rent") && (
                <section className="mb-16">
                  <h2 className="text-2xl font-bold mb-8">
                    Properties for Rent
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {results.rentals_properties.map((property, index) => (
                      <PropertyCard
                        key={`rent-${index}`}
                        property={property}
                        isDark={isDark}
                        type="rent"
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
        <footer
          className={`mt-20 border-t ${
            isDark
              ? "border-gray-800 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {/* Footer content... */}
        </footer>
      </main>

      {/* Simplified AuthModal call */}
      <AuthModal
        showModal={showModal}
        isDark={isDark}
        activeTab={"signin"}
        formData={{ username: "", email: "", password: "" }}
        handleModalClose={handleModalClose}
        handleTabChange={() => {}}
        handleInputChange={() => {}}
        handleSubmit={() => {}}
      />
    </div>
  );
}
