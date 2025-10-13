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

    // Handle shortened URLs by following redirects
    let finalUrl = mapsUrl;
    if (mapsUrl.includes('maps.app.goo.gl') || mapsUrl.includes('goo.gl')) {
      console.log('Shortened URL detected, following redirect...');
      const redirectResponse = await fetch(mapsUrl, { redirect: 'follow' });
      finalUrl = redirectResponse.url;
      console.log('Resolved to:', finalUrl);
    }

    // Extract place name from URL for text search
    let placeName = '';
    const placeMatch = finalUrl.match(/place\/([^/@]+)/);
    if (placeMatch) {
      placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }

    if (!placeName) {
      throw new Error('Could not extract place name from URL. Please use a full Google Maps URL.');
    }

    console.log('Searching for place:', placeName);

    // Use New Places API - Text Search
    const searchUrl = 'https://places.googleapis.com/v1/places:searchText';
    
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.regularOpeningHours,places.websiteUri,places.photos,places.types,places.rating'
      },
      body: JSON.stringify({
        textQuery: placeName
      })
    });

    const searchData = await searchResponse.json();
    console.log('Search API response:', searchData);

    if (!searchData.places || searchData.places.length === 0) {
      throw new Error('Place not found');
    }

    const place = searchData.places[0];
    console.log('Found place:', place.displayName);

    // Extract cuisine from types
    const cuisineTypes = place.types?.filter((type: string) => 
      ['restaurant', 'cafe', 'food', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(type)
    ) || [];
    const cuisine = cuisineTypes.length > 0 
      ? cuisineTypes[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      : '';

    // Format opening hours
    let hours = '';
    if (place.regularOpeningHours?.weekdayDescriptions) {
      hours = place.regularOpeningHours.weekdayDescriptions.join(', ');
    }

    // Get photo URL using new API
    let photoUrl = '';
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`;
    }

    const result = {
      name: place.displayName?.text || '',
      cuisine: cuisine || '',
      location: place.formattedAddress || '',
      hours: hours,
      website: place.websiteUri || '',
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
