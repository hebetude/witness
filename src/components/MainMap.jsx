import { useState, useEffect, useRef } from 'react';
import { generateHistoricalTimeline, getEventIcon, locationsData } from '../util/Generator';
import { RoughBox } from './RoughBox';
import { FloatingContribution } from './FloatingContribution';
import { styles } from '../util/Styles';
import { MapPin, Play, Pause, SkipForward } from 'lucide-react';
import L from 'leaflet';

import '../styles/Main.css';
import 'leaflet/dist/leaflet.css';

const cityLabelsData = locationsData;

// TODO: Remove log statements, I am debugging like a child
const MainMap = () => {
    const [timelineData, setTimelineData] = useState(null);
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedContribution, setSelectedContribution] = useState(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const eventMarkersRef = useRef([]);
    const labelsRef = useRef([]);
    const [, forceUpdate] = useState({});

    useEffect(() => {
        // TODO: Have to change this so that the years are based on the earliest and last events we have
        const data = generateHistoricalTimeline(2000, 2003);
        setTimelineData(data);
    }, []);

    useEffect(() => {
        console.log('Map initialization useEffect - mapRef.current:', mapRef.current);
        console.log('Map initialization useEffect - timelineData:', !!timelineData);

        if (!mapInstanceRef.current && mapRef.current) {
            console.log('Initializing map...');

            // Supposedly a known Leaflet issue. Sam Altman told me to do this.
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // I'm limiting zooming out.
            // TODO: Maybe consider panning to events as they pop up.
            const map = L.map(mapRef.current, {
                center: [31.7, 35.2],
                zoom: 9,
                minZoom: 5,
                maxZoom: 14,
                zoomControl: false,
            });

            console.log("MAP LOADING");

            // Watercolor tiles
            L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>',
                className: 'sepia-filter',
            }).addTo(map);

            L.control.zoom({
                position: 'bottomright'
            }).addTo(map);

            const updateLabelVisibility = () => {
                const zoom = map.getZoom();
                labelsRef.current.forEach((label, index) => {
                    const city = cityLabelsData[index];
                    let minZoom;
                    if (city.tier === 1) {
                        minZoom = 9;
                    } else if (city.tier === 2) {
                        minZoom = 10;
                    } else {
                        minZoom = 12;
                    }
                    label.setOpacity(zoom >= minZoom ? 1 : 0);
                });
            };

            cityLabelsData.forEach((city) => {
                const fontSize = city.tier === 1 ? 16 : city.tier === 2 ? 14 : 12;

                const label = L.divIcon({
                    className: 'city-label',
                    html: `<div class="city-label-text" style="font-size: ${fontSize}px">${city.name}</div>`,
                    iconSize: [100, 20],
                    iconAnchor: [50, 10],
                });

                const labelMarker = L.marker([city.lat, city.lng], {
                    icon: label,
                    interactive: false,
                    zIndexOffset: 500 + (3 - city.tier) * 100,
                    opacity: 0,
                }).addTo(map);

                labelsRef.current.push(labelMarker);
            });

            // This bottom part is not me. The React FAQs actively recommend against doing this and intuitively, it also looks like a
            // terrible idea, but ¯\_(ツ)_/¯
            map.on('zoomend', updateLabelVisibility);
            map.on('move', () => {
                // Force re-render of contributions when map moves
                forceUpdate({});
            });
            map.on('moveend', () => {
                // Force re-render of contributions when map stops moving
                forceUpdate({});
            });
            updateLabelVisibility();

            mapInstanceRef.current = map;

            setTimeout(() => map.invalidateSize(), 100);
        }
    }, [timelineData]);

    useEffect(() => {
        if (!mapInstanceRef.current || !timelineData) return;

        eventMarkersRef.current.forEach(marker => marker.remove());
        eventMarkersRef.current = [];

        const visibleEvents = [];
        for (let i = 0; i <= currentYearIndex; i++) {
            visibleEvents.push(...timelineData.timeline[i].events);
        }

        const currentYear = timelineData.timeline[currentYearIndex].year;

        visibleEvents.forEach(event => {
            const { emoji, color } = getEventIcon(event.type);

            const eventIcon = L.divIcon({
                className: 'event-marker',
                html: `<div class="event-icon" style="opacity: ${event.year === currentYear ? 1 : 0.6};">
                    <span>${emoji}</span>
                </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });

            const marker = L.marker([event.location.lat, event.location.lng], {
                icon: eventIcon,
                zIndexOffset: 1000,
            }).addTo(mapInstanceRef.current);

            marker.on('click', () => {
                console.log('Event clicked:', event);
                console.log('Event contributions:', event.contributions);
                setSelectedEvent(event);
            });

            eventMarkersRef.current.push(marker);
        });
    }, [currentYearIndex, timelineData]);

    console.log('Component render - timelineData:', !!timelineData);
    console.log('Component render - mapRef.current:', mapRef.current);

    return (
        <div style={styles.container}>
            <div ref={mapRef} style={styles.mapContainer} />

            {!timelineData ? (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
                    color: '#3E2A1F',
                    backgroundColor: 'rgba(245, 230, 211, 0.9)',
                    padding: '20px',
                    borderRadius: '8px'
                }}>
                    Loading...
                </div>
            ) : (
                <>
                    {/* Perspective Indicator - Is there actually a point to this? */}
                    <div style={styles.perspectiveIndicator}>
                        <RoughBox>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3E2A1F' }}>
                                <MapPin size={20} />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>You witness these events from </div>
                                    <div>{timelineData.povLocation.name}</div>
                                </div>
                            </div>
                        </RoughBox>
                    </div>

                    {/* Event Panel */}
                    {timelineData.timeline[currentYearIndex].events.length > 0 && (
                        <div style={styles.eventPanel}>
                            <RoughBox>
                                <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#3E2A1F' }}>
                                    {timelineData.timeline[currentYearIndex].year} Events
                                </h3>
                                {timelineData.timeline[currentYearIndex].events.map(event => (
                                    <div
                                        key={event.id}
                                        style={styles.eventItem}
                                        onClick={() => setSelectedEvent(event)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <span style={{ fontSize: '20px' }}>{getEventIcon(event.type).emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: '#3E2A1F' }}>
                                                    {event.title}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#4A3A28', margin: '4px 0' }}>
                                                    {event.description}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6B5423' }}>
                                                    {event.location.name} • {event.distance}km away
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </RoughBox>
                        </div>
                    )}

                    {/* Timeline Controls */}
                    <div style={styles.timelineControls}>
                        <RoughBox>
                            <div style={styles.yearDisplay}>{timelineData.timeline[currentYearIndex].year}</div>

                            <div
                                style={styles.timeline}
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    const percentage = x / rect.width;
                                    const newIndex = Math.floor(percentage * timelineData.timeline.length);
                                    setCurrentYearIndex(Math.max(0, Math.min(newIndex, timelineData.timeline.length - 1)));
                                }}
                            >
                                <div
                                    style={{
                                        ...styles.timelineProgress,
                                        width: `${((currentYearIndex + 1) / timelineData.timeline.length) * 100}%`
                                    }}
                                />
                                {timelineData.timeline.map((yearData, index) => {
                                    if (yearData.events.length === 0) return null;
                                    return (
                                        <div
                                            key={yearData.year}
                                            style={{
                                                ...styles.timelineMarker,
                                                left: `${((index + 0.5) / timelineData.timeline.length) * 100}%`,
                                                backgroundColor: index === currentYearIndex ? '#8B0000' : '#5C4033',
                                            }}
                                            title={`${yearData.year}: ${yearData.events.length} events`}
                                        />
                                    );
                                })}
                            </div>

                            <div style={styles.playControls}>
                                <button
                                    style={styles.controlButton}
                                    onClick={() => setCurrentYearIndex(Math.min(currentYearIndex + 1, timelineData.timeline.length - 1))}
                                    disabled={currentYearIndex >= timelineData.timeline.length - 1}
                                >
                                    Next Year
                                    <SkipForward size={20} />
                                </button>
                            </div>
                        </RoughBox>
                    </div>

                    {/* Selected Event with Floating Contributions */}
                    {selectedEvent && mapInstanceRef.current && (() => {
                        const eventLatLng = L.latLng(selectedEvent.location.lat, selectedEvent.location.lng);
                        const eventPoint = mapInstanceRef.current.latLngToContainerPoint(eventLatLng);

                        return (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 50
                            }}>
                                {selectedEvent.contributions.map((contrib, index) => {
                                    const angle = (index / selectedEvent.contributions.length) * Math.PI * 2;

                                    return (
                                        <div key={contrib.id} style={{ pointerEvents: 'auto' }}>
                                            <FloatingContribution
                                                contribution={contrib}
                                                angle={angle}
                                                distance={120}
                                                centerX={eventPoint.x}
                                                centerY={eventPoint.y}
                                                index={index}
                                                onClick={setSelectedContribution}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}

                    {/* Contribution Detail Modal */}
                    {selectedContribution && (
                        <div
                            style={styles.contributionModal}
                            onClick={() => setSelectedContribution(null)}
                        >
                            <div onClick={(e) => e.stopPropagation()}>
                                <RoughBox style={styles.contributionCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0, color: '#3E2A1F' }}>
                                            {selectedContribution.type.charAt(0).toUpperCase() + selectedContribution.type.slice(1)}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedContribution(null)}
                                            style={{ background: 'none', border: 'none', fontSize: '24px', color: '#8B7355', cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div style={{
                                        color: '#4A3A28',
                                        fontStyle: selectedContribution.type === 'poetry' ? 'italic' : 'normal',
                                        whiteSpace: 'pre-wrap',
                                        marginBottom: '16px',
                                        lineHeight: '1.6'
                                    }}>
                                        {selectedContribution.content}
                                    </div>

                                    {selectedContribution.media && selectedContribution.media.type === 'image' && (
                                        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                            <img
                                                src={selectedContribution.media.url}
                                                alt="Contribution artwork"
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '400px',
                                                    height: 'auto', 
                                                    borderRadius: '4px',
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div style={{ fontSize: '14px', color: '#6B5423', textAlign: 'right' }}>
                                        — {selectedContribution.author}
                                    </div>
                                </RoughBox>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export { MainMap };