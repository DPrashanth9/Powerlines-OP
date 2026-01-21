# 🧪 Testing Your New API Endpoints

Now that the endpoints are implemented, let's test them!

## 🔄 Restart Your Server

Since we made changes, restart your server:

1. **In the terminal where the server is running:**
   - Press `CTRL + C` to stop it
   - Run again: `uvicorn main:app --reload`

2. **Or if using the batch file:**
   - Close and double-click `start_server.bat` again

---

## 🧪 Test Each Endpoint

### Test 1: Get All Components

1. Go to: http://localhost:8000/docs
2. Find **`GET /api/components`**
3. Click "Try it out"
4. Click "Execute"

**Expected Result:**
You should see a list of 8 components:
- plant-001 (Solar Farm Alpha)
- substation-stepup-001
- transmission-001
- substation-trans-001
- substation-dist-001
- distribution-001
- transformer-001
- service-001
- building-001

**Try filtering:**
- Click "Try it out" again
- In the `component_type` field, enter: `Building`
- Click "Execute"
- Should return only Building components

---

### Test 2: Get Single Component

1. Find **`GET /api/components/{component_id}`**
2. Click "Try it out"
3. In the `component_id` field, enter: `building-001`
4. Click "Execute"

**Expected Result:**
```json
{
  "id": "building-001",
  "name": "Residential Building 1",
  "type": "Building",
  "longitude": -122.3394,
  "latitude": 37.8549,
  "properties": null
}
```

**Try another:**
- Try: `plant-001` (Power Generation)
- Try: `transmission-001` (Transmission Line)

**Test error handling:**
- Try: `fake-id-123`
- Should return 404 error with message "Component not found"

---

### Test 3: Path to Source ⭐ **THE BIG ONE!**

This is the core feature of your app!

1. Find **`GET /api/components/{component_id}/path-to-source`**
2. Click "Try it out"
3. In the `component_id` field, enter: `building-001`
4. Click "Execute"

**Expected Result:**
You should see a complete path from the power source to the building:

```json
{
  "component_id": "building-001",
  "path": [
    {
      "id": "plant-001",
      "name": "Solar Farm Alpha",
      "type": "PowerGeneration",
      "longitude": -122.4194,
      "latitude": 37.7749
    },
    {
      "id": "substation-stepup-001",
      "name": "Step-Up Substation 1",
      "type": "StepUpSubstation",
      ...
    },
    ... (all components in between)
    {
      "id": "building-001",
      "name": "Residential Building 1",
      "type": "Building",
      ...
    }
  ]
}
```

**Try different components:**
- `transformer-001` - Should show path from plant to transformer
- `distribution-001` - Should show path from plant to distribution line
- `plant-001` - Should show just the plant (it IS the source!)

---

## 🌐 Direct Browser Testing

You can also test directly in your browser:

### Get All Components:
```
http://localhost:8000/api/components
```

### Get Single Component:
```
http://localhost:8000/api/components/building-001
```

### Path to Source:
```
http://localhost:8000/api/components/building-001/path-to-source
```

### Filter by Type:
```
http://localhost:8000/api/components?component_type=Building
```

---

## ✅ Success Checklist

- [ ] Get all components returns 8 components
- [ ] Filter by type works (e.g., `?component_type=Building`)
- [ ] Get single component returns correct data
- [ ] Invalid component ID returns 404 error
- [ ] Path to source from building returns complete path (9 components)
- [ ] Path is ordered from source (plant) to target (building)
- [ ] All components have coordinates (longitude, latitude)

---

## 🎯 What This Means

### 1. **Get All Components**
- ✅ Can retrieve all power grid components
- ✅ Can filter by type
- ✅ Ready for frontend to display on map

### 2. **Get Single Component**
- ✅ Can get details of any component
- ✅ Error handling works (404 for missing components)
- ✅ Ready for showing component details in UI

### 3. **Path to Source** ⭐
- ✅ Graph traversal works!
- ✅ Can trace electricity flow from any component back to source
- ✅ Returns complete path with all intermediate components
- ✅ This is the CORE feature working!

---

## 🐛 Troubleshooting

### "Component not found" error
- Check the component ID is correct
- Run `python check_database.py` to see available component IDs
- Component IDs should match exactly (case-sensitive)

### Path returns empty
- Component might not be connected to a PowerGeneration source
- Check relationships in Neo4j Browser
- Run: `MATCH (n:Component {id: 'your-id'}) RETURN n`

### Server error 500
- Check server terminal for error messages
- Verify Neo4j is running
- Try restarting the server

---

## 🎓 What You Learned

1. **Neo4j Queries:**
   - Basic MATCH queries to find nodes
   - Variable-length relationships (`[:FEEDS*]`)
   - Path traversal in graph databases

2. **FastAPI:**
   - Response models for type safety
   - Query parameters
   - Error handling (HTTPException)
   - Path parameters

3. **Graph Traversal:**
   - How to find paths between nodes
   - Following relationships backwards
   - Extracting path data

---

## 🚀 Next Steps

Now that your API works:

1. **Test it thoroughly** - Try all the endpoints
2. **Build the frontend** - Connect React to these APIs
3. **Add Mapbox** - Display components on a map
4. **Import real data** - Replace sample data with your GeoJSON

Great job! Your backend is fully functional! 🎉
