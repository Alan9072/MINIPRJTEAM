import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./edit.css";

function EditProfile() {
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, "Users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          console.log("No User Data Found In Firestore");
        }
      } catch (error) {
        console.error("Error Fetching User Data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!auth.currentUser) return;
    setUpdating(true);

    try {
      const userRef = doc(db, "Users", auth.currentUser.uid);
      await updateDoc(userRef, formData);
      console.log("User Details Updated Successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error Updating User Details:", error);
    } finally {
      setUpdating(false);
    }
  };

  const validateInput = (key, value) => {
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return false;
    }
    if ((key === "password" || key === "firstName" || key === "lastName") && value.trim() === "") {
      return false;
    }
    if ((key === "age" || key === "bmi" || key === "hba1c" || key === "weight" || key === "height" || key === "fastingBloodSugar" || key === "postPrandialBloodSugar" || key === "bloodPressure" || key === "waterIntake") && isNaN(value)) {
      return false;
    }
    return true;
  };

  return (
    <div className="edit-profile-container">
      <h1 className="stylish-text">Edit Profile</h1>
      <div className="user-details">
        {["firstName", "lastName", "diabetesType", "foodAvoidance", "bmi", "sugarAlternatives", "gender", "activityLevel", "sugarSensitivity", "allergies", "weight", "hba1c", "email", "height", "fastingBloodSugar", "mealPreference", "password", "age", "dietaryPreference", "waterIntake", "bloodPressure", "medications", "postPrandialBloodSugar"]
          .map((key) => (
            <div key={key} className="form-group">
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
              <input
                type="text"
                name={key}
                value={formData[key] || ""}
                onChange={(e) => {
                  if (validateInput(key, e.target.value)) {
                    handleChange(e);
                  }
                }}
                className="input-field"
              />
            </div>
          ))}
      </div>
      <button className="btn save-button" onClick={handleUpdate} disabled={updating}>
        {updating ? "Updating..." : "Save Changes"}
      </button>
      <button className="btn cancel-button" onClick={() => navigate("/profile")}>
        Cancel
      </button>
    </div>
  );
}

export default EditProfile;