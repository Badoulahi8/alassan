'use client'
import React, { useState } from "react";

const AccountProfile = () => {
  const [profilePhoto, setProfilePhoto] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const handleImage = (e) => {
    // Votre logique de gestion de l'image ici
    const imageFile = e.target.files[0];
    // Exemple de mise à jour de l'état pour l'image
    setProfilePhoto(URL.createObjectURL(imageFile));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Votre logique de soumission ici
    console.log("Submitted Data:", {
      profilePhoto,
      name,
      username,
      bio,
    });
  };

  return (
    <form className="flex flex-col justify-start gap-10" onSubmit={onSubmit}>
      <div className="flex items-center gap-4">
        <label className="account-form_image-label">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="profile_icon"
              width={96}
              height={96}
              className="rounded-full object-contain"
            />
          ) : (
            <img
              src="/assets/profile.svg"
              alt="profile_icon"
              width={24}
              height={24}
              className="object-contain"
            />
          )}
        </label>
        <div className="flex-1 text-base-semibold text-gray-200">
          <input
            type="file"
            accept="image/*"
            placeholder="Add profile photo"
            className="account-form_image-input"
            onChange={handleImage}
          />
        </div>
      </div>

      {/* Rest of the form fields */}
      <div className="flex w-full flex-col gap-3">
        <label className="text-base-semibold text-light-2">Name</label>
        <input
          type="text"
          className="account-form_input no-focus"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <label className="text-base-semibold text-light-2">Username</label>
        <input
          type="text"
          className="account-form_input no-focus"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <label className="text-base-semibold text-light-2">Bio</label>
        <textarea
          rows={10}
          className="account-form_input no-focus"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <button type="submit" className="bg-primary-500">
        Submit
      </button>
    </form>
  );
};

export default AccountProfile;
