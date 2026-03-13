/**
 * Tests for Location Atmosphere System
 */
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import {
  getLocationData,
  getAmbientEvent,
  getAmbientEventByCoords,
  renderAtmospherePanel,
  getLocationBorderStyle,
  getAllLocations,
} from '../src/location-atmosphere.js';

describe('Location Atmosphere System', () => {
  describe('getLocationData', () => {
    it('returns data for valid room ID', () => {
      const data = getLocationData({ roomId: 'center' });
      assert.ok(data);
      assert.equal(data.name, 'Village Square');
      assert.equal(data.icon, '🏘️');
      assert.ok(data.description.length > 0);
      assert.ok(data.ambientEvents.length > 0);
      assert.ok(data.themeColor);
      assert.ok(data.borderAccent);
    });

    it('returns data for valid coordinates', () => {
      const data = getLocationData({ roomRow: 0, roomCol: 0 });
      assert.ok(data);
      assert.equal(data.name, 'Northwest Grove');
    });

    it('returns null for invalid room ID', () => {
      const data = getLocationData({ roomId: 'nonexistent' });
      assert.equal(data, null);
    });

    it('returns null for invalid coordinates', () => {
      const data = getLocationData({ roomRow: 5, roomCol: 5 });
      assert.equal(data, null);
    });

    it('returns null when called with no args', () => {
      const data = getLocationData();
      assert.equal(data, null);
    });

    it('returns data for all 9 rooms by coordinates', () => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const data = getLocationData({ roomRow: row, roomCol: col });
          assert.ok(data, `Missing data for row ${row}, col ${col}`);
          assert.ok(data.name, `Missing name for row ${row}, col ${col}`);
        }
      }
    });
  });

  describe('getAmbientEvent', () => {
    it('returns a string for valid room ID', () => {
      const event = getAmbientEvent('center');
      assert.equal(typeof event, 'string');
      assert.ok(event.length > 0);
    });

    it('returns null for invalid room ID', () => {
      const event = getAmbientEvent('nonexistent');
      assert.equal(event, null);
    });

    it('returns different events over multiple calls (randomness)', () => {
      const events = new Set();
      for (let i = 0; i < 50; i++) {
        events.add(getAmbientEvent('center'));
      }
      // Should get at least 2 different events in 50 tries
      assert.ok(events.size >= 2, `Only got ${events.size} unique events`);
    });
  });

  describe('getAmbientEventByCoords', () => {
    it('returns a string for valid coords', () => {
      const event = getAmbientEventByCoords(1, 1);
      assert.equal(typeof event, 'string');
      assert.ok(event.length > 0);
    });

    it('returns null for invalid coords', () => {
      const event = getAmbientEventByCoords(9, 9);
      assert.equal(event, null);
    });
  });

  describe('renderAtmospherePanel', () => {
    it('renders panel for valid state', () => {
      const html = renderAtmospherePanel({ world: { roomRow: 1, roomCol: 1 } });
      assert.ok(html.includes('Village Square'));
      assert.ok(html.includes('atmosphere-panel'));
      assert.ok(html.includes('🏘️'));
    });

    it('renders fallback for missing state', () => {
      const html = renderAtmospherePanel({});
      // defaults to roomRow: 1, roomCol: 1 (center)
      assert.ok(html.includes('Village Square'));
    });

    it('renders fallback for null state', () => {
      const html = renderAtmospherePanel(null);
      assert.ok(html.includes('atmosphere-panel'));
    });

    it('escapes HTML in output', () => {
      // All location names are safe, but verify no raw < or > 
      const html = renderAtmospherePanel({ world: { roomRow: 0, roomCol: 0 } });
      assert.ok(!html.includes('<script'));
    });

    it('renders all 9 locations without error', () => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const html = renderAtmospherePanel({ world: { roomRow: row, roomCol: col } });
          assert.ok(html.includes('atmosphere-panel'));
        }
      }
    });
  });

  describe('getLocationBorderStyle', () => {
    it('returns CSS for valid coords', () => {
      const style = getLocationBorderStyle(1, 1);
      assert.ok(style.includes('border-top'));
    });

    it('returns empty string for invalid coords', () => {
      const style = getLocationBorderStyle(9, 9);
      assert.equal(style, '');
    });
  });

  describe('getAllLocations', () => {
    it('returns all 9 locations', () => {
      const locations = getAllLocations();
      assert.equal(locations.length, 9);
    });

    it('each location has required fields', () => {
      const locations = getAllLocations();
      for (const loc of locations) {
        assert.ok(loc.id, 'Missing id');
        assert.ok(loc.name, 'Missing name');
        assert.ok(loc.icon, 'Missing icon');
        assert.equal(typeof loc.row, 'number');
        assert.equal(typeof loc.col, 'number');
      }
    });

    it('locations cover the 3x3 grid', () => {
      const locations = getAllLocations();
      const coords = locations.map(l => `${l.row},${l.col}`).sort();
      assert.deepEqual(coords, ['0,0', '0,1', '0,2', '1,0', '1,1', '1,2', '2,0', '2,1', '2,2']);
    });
  });
});
