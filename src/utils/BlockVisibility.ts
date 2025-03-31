interface Position {
  lat: number;
  lng: number;
}

export const isWithinRadius = (learnplacePosition: Position, learnplaceRadius: number, currentUserPosition: Position) => {
  function isUserWithinRadius(learnplacePosition: {lat: number, lng: number}, learnplaceRadius: number, currentUserPosition: {lat: number, lng: number}) {
    if (!currentUserPosition || !learnplacePosition) return false; // Falls Positionen ungültig sind

    const earthRadius = 6371000; // Radius der Erde in Metern

    // Konvertiere Breitengrad und Längengrad von Grad in Bogenmaß
    const dLat = toRadians(currentUserPosition.lat - learnplacePosition.lat);
    const dLng = toRadians(currentUserPosition.lng - learnplacePosition.lng);

    const lat1 = toRadians(learnplacePosition.lat);
    const lat2 = toRadians(currentUserPosition.lat);

    // Haversine-Formel
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c; // Entfernung in Metern

    return distance <= learnplaceRadius; // true, wenn innerhalb des Radius
  }

  function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  return isUserWithinRadius(learnplacePosition, learnplaceRadius, currentUserPosition);
}

export const isVisible = (visited: boolean, isWithinLearnplaceRadius: boolean, visibleStatus: string) =>  {
  if (visibleStatus === 'AFTER_VISIT_PLACE' && !visited) {
    return false;
  } else if (visibleStatus === 'ONLY_AT_PLACE') {
    if (!isWithinLearnplaceRadius) {
      return false;
    }
  }
  return true;
}
