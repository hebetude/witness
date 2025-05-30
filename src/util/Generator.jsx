// Historical Timeline Generator
// Generates a timeline of witnessed historical events from a 25-year conflict

// Import functions (commented out for production use)
import historicalEventsData from '../data/historicalEvents.json';
import contributionsData from '../data/contributions.json';
import locationsData from '../data/locations.json';


// Event type configurations
const eventTypeConfig = {
  bombing: { 
    emoji: "💥", 
    color: "#8B0000",
    // iconPath: "/icons/bombing.svg" // Optional: path to custom icon
  },
  political: { 
    emoji: "📜", 
    color: "#1E3A8A",
    // iconPath: "/icons/political.svg"
  },
  raid: { 
    emoji: "⚔️", 
    color: "#6B4423",
    // iconPath: "/icons/raid.svg"
  },
  siege: { 
    emoji: "🏰", 
    color: "#4A3A28",
    // iconPath: "/icons/siege.svg"
  },
  displacement: { 
    emoji: "🏚️", 
    color: "#D2691E",
    // iconPath: "/icons/displacement.svg"
  },
  chemical: { 
    emoji: "☣️", 
    color: "#228B22",
    // iconPath: "/icons/chemical.svg"
  },
  ceasefire: { 
    emoji: "🕊️", 
    color: "#F5F5DC",
    // iconPath: "/icons/ceasefire.svg"
  }
};

// Helper functions
function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function selectRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function selectResponsesByDistance(event, witnessLocation, contributions) {
  const distance = calculateDistance(event.location, witnessLocation);
  
  // Filter contributions based on distance relevance
  const relevant = contributions.filter(contrib => {
    const [minDist, maxDist] = contrib.distance_relevance;
    return distance >= minDist && distance <= maxDist;
  });
  
  // Select a subset (3-5 contributions)
  const selectedCount = Math.floor(Math.random() * 3) + 3;
  return selectRandom(relevant, selectedCount);
}

function selectWitnessLocation() {
  // Select a random city as witness location
  const cities = locationsData.filter(loc => loc.type === 'city');
  return cities[Math.floor(Math.random() * cities.length)];
}

// Main timeline generator
function generateHistoricalTimeline(startYear = 2000, endYear = 2025) {
  const timeline = [];
  const witnessLocation = selectWitnessLocation();
  
  // Generate events for each year
  for (let year = startYear; year <= endYear; year++) {
    const yearEvents = historicalEventsData[year.toString()] || [];
    
    if (yearEvents.length === 0) {
      // No events this year - quiet year
      timeline.push({
        year,
        events: [],
        witnessLocation,
        quietYear: true
      });
      continue;
    }
    
    // Always include major events
    const majorEvents = yearEvents.filter(e => e.priority === 'major');
    const minorEvents = yearEvents.filter(e => e.priority === 'minor');
    
    // Randomly select 1-2 minor events
    const selectedMinor = selectRandom(minorEvents, Math.floor(Math.random() * 2) + 1);
    
    // Combine and process events
    const selectedEvents = [...majorEvents, ...selectedMinor].map(event => {
      // Get contributions for this event
      const eventContributions = contributionsData[event.id] || [];
      
      // Select visible contributions based on distance
      const visibleContributions = selectResponsesByDistance(
        event,
        witnessLocation,
        eventContributions
      );
      
      return {
        ...event,
        contributions: visibleContributions,
        distance: Math.round(calculateDistance(event.location, witnessLocation))
      };
    });
    
    timeline.push({
      year,
      events: selectedEvents,
      witnessLocation,
      totalCasualties: selectedEvents.reduce((sum, e) => sum + e.casualties, 0)
    });
  }
  
  return {
    timeline,
    witnessLocation,
    totalEvents: timeline.reduce((sum, year) => sum + year.events.length, 0),
    totalCasualties: timeline.reduce((sum, year) => sum + year.totalCasualties, 0)
  };
}

// Function to get event icon (emoji or custom image)
function getEventIcon(eventType) {
  const config = eventTypeConfig[eventType];
  if (!config) return { emoji: "❓", color: "#666666" };
  
  return {
    emoji: config.emoji,
    color: config.color,
    iconPath: config.iconPath || null
  };
}

// Export functions
export { 
  generateHistoricalTimeline, 
  getEventIcon,
  eventTypeConfig,
  locationsData,
  calculateDistance
};