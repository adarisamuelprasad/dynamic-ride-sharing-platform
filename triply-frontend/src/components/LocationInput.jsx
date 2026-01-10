import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { rideService } from "@/services/rideService";

const LocationInput = ({ label, value, onChange, placeholder, iconColor = "text-primary" }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = async (e) => {
        const query = e.target.value;
        onChange(query);

        if (query.length > 2) {
            try {
                const results = await rideService.autocomplete(query);
                setSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete error:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (suggestion) => {
        onChange(suggestion.display_name);
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <label className="text-foreground font-medium text-sm block">{label}</label>
            <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${iconColor}`} />
                <Input
                    placeholder={placeholder}
                    className="pl-10"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => value.length > 2 && setShowSuggestions(true)}
                    required
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-60 overflow-auto">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                                onClick={() => handleSelect(item)}
                            >
                                {item.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LocationInput;
