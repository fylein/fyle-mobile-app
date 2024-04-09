export interface MileageRoute {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  waypoints: google.maps.LatLngLiteral[];
  directionsPolyline?: string;
}
