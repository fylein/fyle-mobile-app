export interface MileageRoute {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  waypoints: google.maps.LatLngLiteral[];
  directions?: google.maps.DirectionsRoute;
}
