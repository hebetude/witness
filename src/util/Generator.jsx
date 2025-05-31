import historicalEventsData from '../data/historicalEvents.json';
import contributionsData from '../data/contributions.json';
import locationsData from '../data/locations.json';
import { eventTypeConfig } from './EventTypes';

// Who knows what this fucking function does ¯\_(ツ)_/¯
function calculateDistance(loc1, loc2) {
  const R = 6371;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function selectRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function selectResponsesByDistance(event, povLocation, contributions) {
  const distance = calculateDistance(event.location, povLocation);

  // Same question as below here. Why are we filtering by distance? Does it make sense?
  const relevant = contributions.filter(contrib => {
    const [minDist, maxDist] = contrib.distance_relevance;
    return distance >= minDist && distance <= maxDist;
  });

  const selectedCount = Math.floor(Math.random() * 3) + 3;
  return selectRandom(relevant, selectedCount);
}

function selectPOVLocation() {
  const cities = locationsData.filter(loc => loc.type === 'city');
  return cities[Math.floor(Math.random() * cities.length)];
}

// Should consider whether to allow quiet years at all.
// Instead of 
function generateHistoricalTimeline(startYear, endYear) {
  const timeline = [];
  const povLocation = selectPOVLocation();

  for (let year = startYear; year <= endYear; year++) {
    const yearEvents = historicalEventsData[year.toString()] || [];

    if (yearEvents.length === 0) {
      // No events this year - quiet year
      timeline.push({
        year,
        events: [],
        povLocation,
        quietYear: true
      });
      continue;
    }

    // Always include major events
    // If we have a lot of major events, maybe we'd also want to randomly pick some subset of them
    const majorEvents = yearEvents.filter(e => e.priority === 'major');
    const minorEvents = yearEvents.filter(e => e.priority === 'minor');

    // Randomly select 1-2 minor events
    const selectedMinor = selectRandom(minorEvents, Math.floor(Math.random() * 2) + 1);

    const selectedEvents = [...majorEvents, ...selectedMinor].map(event => {
      const eventContributions = contributionsData[event.id] || [];

      // The idea is that contributions can be specific to where some event is being observed from,
      // but is this meaningful or useful at all? All of the contributions I can think of for now are 
      // agnostic of location. Filtering out contributions based on distance also assumes that there will
      // be enough contributions to be picky about
      const visibleContributions = selectResponsesByDistance(
        event,
        povLocation,
        eventContributions
      );

      console.log(visibleContributions);

      return {
        ...event,
        year: year,
        contributions: visibleContributions,
        distance: Math.round(calculateDistance(event.location, povLocation))
      };
    });

    timeline.push({
      year,
      events: selectedEvents,
      povLocation,
      totalCasualties: selectedEvents.reduce((sum, e) => sum + e.casualties, 0)
    });
  }

  return {
    timeline,
    povLocation,
    totalEvents: timeline.reduce((sum, year) => sum + year.events.length, 0),
    totalCasualties: timeline.reduce((sum, year) => sum + year.totalCasualties, 0)
  };
}

// Currently using emojis, but can use custom icons if I'm able
function getEventIcon(eventType) {
  const config = eventTypeConfig[eventType];
  if (!config) return { emoji: "❓", color: "#666666", splotch: "/images/blue.png" };

  return {
    emoji: config.emoji,
    color: config.color,
    splotch: config.splotch || "/images/blue.png"
  };
}

export {
  generateHistoricalTimeline,
  getEventIcon,
  eventTypeConfig,
  locationsData,
  calculateDistance
};