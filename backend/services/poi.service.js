const {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} = require('firebase/firestore');
const { db } = require('../firebase.config');
const authService = require('./auth.service');
const encryptionService = require('./encryption.service');

class POIService {
  async addPOI(poiData, userId) {
    try {
      // Verify user has admin role
      const isAdmin = await authService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      const poiRef = await addDoc(collection(db, 'pois'), {
        ...poiData,
        createdAt: Timestamp.now(),
        createdBy: userId,
        updatedAt: Timestamp.now()
      });

      const poiDoc = await getDoc(poiRef);
      return {
        id: poiRef.id,
        ...poiDoc.data()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async bulkAddPOIs(pois, userId) {
    try {
      // Verify user has admin role
      const isAdmin = await authService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      const batch = writeBatch(db);
      const addedPOIs = [];

      for (const poi of pois) {
        const poiRef = doc(collection(db, 'pois'));
        batch.set(poiRef, {
          ...poi,
          createdAt: Timestamp.now(),
          createdBy: userId,
          updatedAt: Timestamp.now()
        });
        addedPOIs.push(poiRef);
      }

      await batch.commit();

      // Fetch the added POIs
      const poiDocs = await Promise.all(
        addedPOIs.map(ref => getDoc(ref))
      );

      return poiDocs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updatePOI(poiId, poiData, userId) {
    try {
      // Verify user has admin role
      const isAdmin = await authService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      const poiRef = doc(db, 'pois', poiId);
      const poiDoc = await getDoc(poiRef);

      if (!poiDoc.exists()) {
        throw new Error('POI not found');
      }

      await updateDoc(poiRef, {
        ...poiData,
        updatedAt: Timestamp.now(),
        updatedBy: userId
      });

      const updatedDoc = await getDoc(poiRef);
      return {
        id: poiId,
        ...updatedDoc.data()
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deletePOI(poiId, userId) {
    try {
      // Verify user has admin role
      const isAdmin = await authService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      const poiRef = doc(db, 'pois', poiId);
      const poiDoc = await getDoc(poiRef);

      if (!poiDoc.exists()) {
        throw new Error('POI not found');
      }

      await deleteDoc(poiRef);
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getAllPOIs(userId, pageSize = 10, lastDoc = null) {
    try {
      // Verify user has admin role
      const isAdmin = await authService.hasRole(userId, 'admin');
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin role required');
      }

      let q = query(
        collection(db, 'pois'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const pois = [];
      
      snapshot.forEach(doc => {
        pois.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        pois,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update Haversine formula to use meters
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async searchPOIs(searchQuery, userId) {
    try {
      const { encryptedLat, encryptedLng, encryptedRadius } = searchQuery;

      // Store search history
      await this.addSearchHistory(userId, searchQuery);

      // Get all POIs
      const snapshot = await getDocs(collection(db, 'pois'));
      console.log('Total POIs in database:', snapshot.size);
      
      const pois = [];
      
      // Decrypt the search coordinates and radius
      let searchLat, searchLng, radius;
      try {
        // Decrypt the search coordinates using the encryption service
        const decryptedCoords = encryptionService.decryptCoordinates(
          encryptedLat,
          encryptedLng
        );
        searchLat = decryptedCoords.lat;
        searchLng = decryptedCoords.lng;
        
        // Decrypt the radius if provided (already in meters from frontend)
        if (encryptedRadius) {
          radius = encryptionService.decryptRadius(encryptedRadius);
        } else {
          radius = 10000; // Default 10km radius in meters
        }
        
        console.log('Search parameters:', {
          searchLat,
          searchLng,
          radius: `${radius}m (${radius/1000}km)`
        });
      } catch (error) {
        console.error('Error decrypting search parameters:', error);
        throw new Error('Invalid search parameters');
      }

      let totalProcessed = 0;
      let skippedInvalid = 0;
      let withinRadius = 0;

      // Filter POIs based on distance
      snapshot.forEach(doc => {
        const poi = doc.data();
        totalProcessed++;
        
        try {
          // Decrypt the POI coordinates using the encryption service
          const decryptedPOICoords = encryptionService.decryptCoordinates(
            poi.encryptedLat,
            poi.encryptedLng
          );

          // Calculate distance in meters
          const distance = this.calculateDistance(
            searchLat,
            searchLng,
            decryptedPOICoords.lat,
            decryptedPOICoords.lng
          );

          // Only include POIs within the radius (both in meters)
          if (distance <= radius) {
            withinRadius++;
            pois.push({
              id: doc.id,
              ...poi,
              distance: distance / 1000 // Convert to km for display
            });
          }
        } catch (error) {
          console.warn('Error processing POI:', doc.id, error);
          skippedInvalid++;
        }
      });

      console.log('Search results summary:', {
        totalPOIs: snapshot.size,
        totalProcessed,
        skippedInvalid,
        withinRadius,
        returnedResults: pois.length
      });

      // Sort results by distance
      pois.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      return pois;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error(error.message);
    }
  }

  async addSearchHistory(userId, searchQuery) {
    try {
      await addDoc(collection(db, 'search_history'), {
        userId,
        query: searchQuery,
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding search history:', error);
    }
  }

  async getSearchHistory(userId) {
    try {
      const q = query(
        collection(db, 'search_history'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const history = [];
      
      snapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return history;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = new POIService(); 