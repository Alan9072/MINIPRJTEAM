import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./user.css";

function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("User Is Not Logged In");
        setLoading(false);
        return;
      }

      console.log("User:", user);

      try {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
          setFormData(docSnap.data());
          console.log("User Data:", docSnap.data());
        } else {
          console.log("No User Data Found In Firestore");
        }
      } catch (error) {
        console.error("Error Fetching User Data:", error);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
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
      setUserDetails(formData);
      setEditMode(false);
      console.log("User Details Updated Successfully!");
    } catch (error) {
      console.error("Error Updating User Details:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User Logged Out Successfully!");
    } catch (error) {
      console.error("Error Logging Out:", error.message);
    }
  };

  const handleHomeRedirect = () => {
    navigate("/"); // Redirect to home page
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      {userDetails ? (
        <>
          <div className="profile-picture-container">
            {userDetails.photo && (
              <img src={userDetails.photo} className="profile-picture" alt="User Profile" />
            )}
          </div>
          {!editMode && (
            <h1 className="stylish-text">
              Welcome {capitalizeFirstLetter(userDetails.firstName) || "User"} 
            </h1>
          )}

          <div className="user-details">
            <div className="form-group">
              <label>First Name:</label>
              {editMode ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              ) : (
                <p>{capitalizeFirstLetter(userDetails.firstName)}</p>
              )}
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              {editMode ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  className="input-field"
                />
              ) : (
                <p>{capitalizeFirstLetter(userDetails.lastName)}</p>
              )}
            </div>
            {Object.entries(userDetails).map(([key, value]) => (
              key !== "photo" && key !== "firstName" && key !== "lastName" && (
                <div key={key} className="form-group">
                  <label>{capitalizeFirstLetter(key)}:</label>
                  {editMode ? (
                    <input
                      type="text"
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p>{value}</p>
                  )}
                </div>
              )
            ))}
          </div>
          <button className="btn home-button" onClick={handleHomeRedirect}>
            Home
          </button>
          {editMode ? (
            <button className="btn update-button" onClick={handleUpdate} disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </button>
          ) : (
            <button className="btn edit-button" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          )}

          <button className="btn logout-button" onClick={handleLogout}>
            Logout
          </button>

        </>
      ) : (
        <p>No User Data Found.</p>
      )}
    </div>
  );
}

export default Profile;