import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mapsUrl } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');

    if (!apiKey) {
      throw new Error('Google Places API key not configured');
    }

    console.log('Processing Google Maps URL:', mapsUrl);

    // Extract place name from URL for text search
    let placeName = '';
    const placeMatch = mapsUrl.match(/place\/([^/]+)/);
    if (placeMatch) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }

    if (!placeName) {
      throw new Error('Could not extract place name from URL');
    }

    console.log('Searching for place:', placeName);

    // Step 1: Find Place from Text to get place_id
    const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    
    const findPlaceResponse = await fetch(findPlaceUrl);
    const findPlaceData = await findPlaceResponse.json();

    console.log('Find Place API response:', findPlaceData);

    if (findPlaceData.status !== 'OK' || !findPlaceData.candidates?.length) {
      throw new Error('Place not found');
    }

    const placeId = findPlaceData.candidates[0].place_id;
    console.log('Found place_id:', placeId);

    // Step 2: Get Place Details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,opening_hours,website,photos,types,rating&key=${apiKey}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    console.log('Place Details API response:', detailsData);

    if (detailsData.status !== 'OK') {
      throw new Error('Failed to fetch place details');
    }

    const place = detailsData.result;

    // Extract cuisine from types
    const cuisineTypes = place.types?.filter((type: string) => 
      ['restaurant', 'cafe', 'food', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(type)
    ) || [];
    const cuisine = cuisineTypes.length > 0 
      ? cuisineTypes[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      : '';

    // Format opening hours
    let hours = '';
    if (place.opening_hours?.weekday_text) {
      hours = place.opening_hours.weekday_text.join(', ');
    }

    // Get photo URL
    let photoUrl = '';
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
    }

    const result = {
      name: place.name || '',
      cuisine: cuisine || '',
      location: place.formatted_address || '',
      hours: hours,
      website: place.website || '',
      photoUrl: photoUrl,
      rating: place.rating || 3,
    };

    console.log('Returning autofilled data:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-places-autofill:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch place data';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
