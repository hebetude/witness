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

const MainMap = () => {
    const [timelineData, setTimelineData] = useState(null);
    const [currentYearIndex, setCurrentYearIndex] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedContribution, setSelectedContribution] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const eventMarkersRef = useRef([]);
    const labelsRef = useRef([]);

    // Initialize timeline on mount
    useEffect(() => {
        const data = generateHistoricalTimeline(2000, 2010); // Limited years for demo
        setTimelineData(data);
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            const map = L.map(mapRef.current, {
                center: [52.0, 19.0],
                zoom: 6,
                minZoom: 5,
                maxZoom: 10,
                zoomControl: false,
            });

            console.log("MAP LOADING");

            // Add watercolor tiles
            L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, hosted by <a href="https://stadiamaps.com/">Stadia Maps</a>',
                className: 'sepia-filter',
            }).addTo(map);

            L.control.zoom({
                position: 'bottomright'
            }).addTo(map);

            // Add city labels
            const updateLabelVisibility = () => {
                const zoom = map.getZoom();
                labelsRef.current.forEach((label, index) => {
                    const city = cityLabelsData[index];
                    const minZoom = city.tier === 1 ? 5 : city.tier === 2 ? 7 : 8;
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

            map.on('zoomend', updateLabelVisibility);
            updateLabelVisibility();

            mapInstanceRef.current = map;
        }
    }, []);

    // Update event markers when year changes
    useEffect(() => {
        if (!mapInstanceRef.current || !timelineData) return;

        // Clear existing event markers
        eventMarkersRef.current.forEach(marker => marker.remove());
        eventMarkersRef.current = [];

        // Get all events up to current year
        const visibleEvents = [];
        for (let i = 0; i <= currentYearIndex; i++) {
            visibleEvents.push(...timelineData.timeline[i].events);
        }

        // Add markers for all visible events
        visibleEvents.forEach(event => {
            const { emoji, color } = getEventIcon(event.type);

            // Create custom icon
            const eventIcon = L.divIcon({
                className: 'event-marker',
                html: `<div class="event-icon" style="background-color: ${color}; opacity: ${event.year === currentYear ? 1 : 0.6
                    }">${emoji}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            const marker = L.marker([event.location.lat, event.location.lng], {
                icon: eventIcon,
                zIndexOffset: 100,
            }).addTo(mapInstanceRef.current);

            marker.on('click', () => setSelectedEvent(event));
            eventMarkersRef.current.push(marker);
        });
    }, [currentYearIndex, timelineData]);

    // Auto-play functionality
    useEffect(() => {
        if (!isPlaying || !timelineData) return;

        const interval = setInterval(() => {
            setCurrentYearIndex(prev => {
                if (prev >= timelineData.timeline.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [isPlaying, timelineData]);

    if (!timelineData) return <div>Loading...</div>;

    const currentYear = timelineData.timeline[currentYearIndex].year;
    const currentYearData = timelineData.timeline[currentYearIndex];
    const witnessLocation = timelineData.witnessLocation;

    

    return (
        <div style={styles.container}>
            <div ref={mapRef} style={styles.mapContainer} />

            {/* Perspective Indicator */}
            <div style={styles.perspectiveIndicator}>
                <RoughBox>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3E2A1F' }}>
                        <MapPin size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>You are witnessing from:</div>
                            <div>{witnessLocation.name}</div>
                        </div>
                    </div>
                </RoughBox>
            </div>

            {/* Event Panel */}
            {currentYearData.events.length > 0 && (
                <div style={styles.eventPanel}>
                    <RoughBox>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#3E2A1F' }}>
                            {currentYear} Events
                        </h3>
                        {currentYearData.events.map(event => (
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
                    <div style={styles.yearDisplay}>{currentYear}</div>

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
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
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
            {selectedEvent && (
                <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 50, pointerEvents: 'none' }}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {selectedEvent.contributions.map((contrib, index) => {
                            const angle = (index / selectedEvent.contributions.length) * Math.PI * 2;
                            const distance = 150 + Math.random() * 50;

                            return (
                                <div key={contrib.id} style={{ pointerEvents: 'auto' }}>
                                    <FloatingContribution
                                        contribution={contrib}
                                        angle={angle}
                                        distance={distance}
                                        onClick={setSelectedContribution}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

                            {selectedContribution.media_type === 'image' && (
                                <div style={{ marginBottom: '16px' }}>
                                    <img
                                        src={selectedContribution.content}
                                        alt="Contribution artwork"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
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

        </div>
    );
};

export { MainMap };