"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "./firebase";
import "./register.css";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    diabetesType: "",
    hba1c: "",
    fastingBloodSugar: "",
    postprandialBloodSugar: "",
    medications: "",
    dietaryPreference: "",
    allergies: "",
    bloodPressure: "",
    activityLevel: "",
    mealPreference: "",
    waterIntake: "",
    sugarSensitivity: "",
    sugarAlternatives: "",
    foodAvoidances: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });

  // Validate names (Only letters and spaces allowed)
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "firstName" || name === "lastName") && !validateName(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "Only letters and spaces are allowed",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const calculateBMI = () => {
    const heightInMeters = formData.height / 100;
    const bmi = formData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
      toast.error("Invalid name format. Only letters and spaces are allowed.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      if (user) {
        const bmi = calculateBMI();
        await setDoc(doc(db, "Users", user.uid), {
          ...formData,
          bmi,
          email: user.email,
        });
      }

      toast.success("Registration successful!", { position: "top-center" });
      // Redirect if needed: window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Sign Up</h2>

        <section className="form-section">
          <h3>Basic Information</h3>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
          />
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}

          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
          />
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}

          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required />

          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" required />
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" required />
        </section>

        <section className="form-section">
          <h3>Medical & Health Details</h3>
          <select name="diabetesType" value={formData.diabetesType} onChange={handleChange} required>
            <option value="">Select Diabetes Type</option>
            <option value="Type 1">Type 1</option>
            <option value="Type 2">Type 2</option>
            <option value="Gestational">Gestational</option>
            <option value="Prediabetes">Prediabetes</option>
          </select>

          <input type="number" name="hba1c" value={formData.hba1c} onChange={handleChange} placeholder="HbA1c Level (%)" step="0.1" />
          <input type="number" name="fastingBloodSugar" value={formData.fastingBloodSugar} onChange={handleChange} placeholder="Fasting Blood Sugar (mg/dL)" />
          <input type="number" name="postprandialBloodSugar" value={formData.postprandialBloodSugar} onChange={handleChange} placeholder="Postprandial Blood Sugar (mg/dL)" />
          <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="Current Medications" />
          <input type="text" name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} placeholder="Dietary Preference" />
          <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Known Allergies" />
          <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="Blood Pressure" />
        </section>

        <section className="form-section">
          <h3>Lifestyle & Activity</h3>
          <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} required>
            <option value="">Select Activity Level</option>
            <option value="Sedentary">Sedentary</option>
            <option value="Lightly Active">Lightly Active</option>
            <option value="Moderately Active">Moderately Active</option>
            <option value="Very Active">Very Active</option>
          </select>
          <input type="text" name="mealPreference" value={formData.mealPreference} onChange={handleChange} placeholder="Meal Preferences" />
          <input type="number" name="waterIntake" value={formData.waterIntake} onChange={handleChange} placeholder="Water Intake (Liters per Day)" step="0.1" />
        </section>

        <section className="form-section">
          <h3>Food Preferences & Sensitivities</h3>
          <select name="sugarSensitivity" value={formData.sugarSensitivity} onChange={handleChange}>
            <option value="">Sugar Sensitivity Level</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
          </select>
          <input type="text" name="sugarAlternatives" value={formData.sugarAlternatives} onChange={handleChange} placeholder="Preferred Sugar Alternatives" />
          <input type="text" name="foodAvoidances" value={formData.foodAvoidances} onChange={handleChange} placeholder="Specific Food Avoidances" />
        </section>

        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
      <p className="login-link">Already have an account? <a href="/login">Log in</a></p>
    </div>
  );
}

export default Register;
