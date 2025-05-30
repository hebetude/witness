// Historical Timeline Generator
// Generates a timeline of witnessed historical events from a 25-year conflict

// Import functions (commented out for production use)
// import historicalEventsData from './data/historicalEvents.json';
// import contributionsData from './data/contributions.json';
// import locationsData from './data/locations.json';

// Placeholder data - replace with imported JSON
const historicalEventsData = {
  "2000": [
    {
      id: "krakow_market_bombing",
      type: "bombing",
      priority: "major",
      location: { name: "Kraków", lat: 50.0647, lng: 19.9450 },
      date: "2000-03-15",
      title: "Kraków Market Bombing",
      description: "Central market bombed during morning rush, 47 civilians killed",
      casualties: 47
    },
    {
      id: "peace_talks_fail",
      type: "political",
      priority: "major",
      location: { name: "Warsaw", lat: 52.2297, lng: 21.0122 },
      date: "2000-06-10",
      title: "Peace Talks Collapse",
      description: "Third attempt at negotiations fails after 5 days",
      casualties: 0
    },
    {
      id: "village_raid_podlasie",
      type: "raid",
      priority: "minor",
      location: { name: "Rural Podlasie", lat: 53.0, lng: 22.5 },
      date: "2000-08-22",
      title: "Podlasie Village Raids",
      description: "Series of night raids on rural villages, 12 dead, hundreds flee",
      casualties: 12
    }
  ],
  "2001": [
    {
      id: "siege_of_lublin",
      type: "siege",
      priority: "major",
      location: { name: "Lublin", lat: 51.2465, lng: 22.5684 },
      date: "2001-02-01",
      title: "Siege of Lublin Begins",
      description: "City of 300,000 cut off from supply lines",
      casualties: 0
    },
    {
      id: "refugee_camp_established",
      type: "displacement",
      priority: "minor",
      location: { name: "Białystok", lat: 53.1325, lng: 23.1688 },
      date: "2001-04-15",
      title: "Białystok Refugee Camp",
      description: "Makeshift camp grows to 15,000 displaced persons",
      casualties: 0
    }
  ],
  "2002": [
    {
      id: "chemical_attack_lodz",
      type: "chemical",
      priority: "major",
      location: { name: "Łódź", lat: 51.7592, lng: 19.4560 },
      date: "2002-11-30",
      title: "Chemical Attack on Łódź",
      description: "Industrial district targeted, toxic cloud forces evacuation",
      casualties: 89
    }
  ]
};

// Placeholder contributions data
const contributionsData = {
  "krakow_market_bombing": [
    {
      id: "contrib_001",
      type: "personal",
      content: "My daughter asked why the market is gone. I had no answer.",
      author: "Anonymous",
      distance_relevance: [0, 100] // Relevant within 100km
    },
    {
      id: "contrib_002",
      type: "poetry",
      content: "Forty-seven souls at market day\nBuying bread when death came\nNow empty stalls bear witness\nTo ordinary lives, extraordinary loss",
      author: "M. Kowalska",
      distance_relevance: [0, 500]
    },
    {
      id: "contrib_003",
      type: "news",
      content: "Radio Warsaw: 'Reports confirm massive explosion in Kraków's historic market square at 9:47 AM. Emergency services overwhelmed.'",
      author: "Radio Warsaw transcript",
      distance_relevance: [100, 1000]
    },
    {
      id: "contrib_004",
      type: "question",
      content: "If it can happen there, in broad daylight, in the heart of the city - where are we safe?",
      author: "Overheard in Warsaw",
      distance_relevance: [50, 300]
    },
    {
      id: "contrib_005",
      type: "artwork",
      content: "sketches/empty_market_stalls.jpg",
      media_type: "image",
      author: "Unknown artist",
      distance_relevance: [0, 200]
    }
  ],
  "peace_talks_fail": [
    {
      id: "contrib_006",
      type: "personal",
      content: "We dared to hope for five days. Now what?",
      author: "Warsaw resident",
      distance_relevance: [0, 1000]
    },
    {
      id: "contrib_007",
      type: "news",
      content: "NEGOTIATIONS COLLAPSE - Delegates leave Warsaw without agreement",
      author: "Newspaper headline",
      distance_relevance: [0, 1000]
    }
  ]
};

// Placeholder locations data
const locationsData = [
  { name: "Warsaw", lat: 52.2297, lng: 21.0122, type: "city", tier: 1 },
  { name: "Kraków", lat: 50.0647, lng: 19.9450, type: "city", tier: 1 },
  { name: "Łódź", lat: 51.7592, lng: 19.4560, type: "city", tier: 1 },
  { name: "Lublin", lat: 51.2465, lng: 22.5684, type: "city", tier: 2 },
  { name: "Białystok", lat: 53.1325, lng: 23.1688, type: "city", tier: 2 },
  { name: "Gdańsk", lat: 54.3520, lng: 18.6466, type: "city", tier: 1 },
  { name: "Poznań", lat: 52.4064, lng: 16.9252, type: "city", tier: 1 },
  { name: "Rural Podlasie", lat: 53.0, lng: 22.5, type: "rural", tier: 3 },
  { name: "Rural Mazovia", lat: 52.5, lng: 20.5, type: "rural", tier: 3 }
];

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