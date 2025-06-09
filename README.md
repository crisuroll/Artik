
# 🖼️ Artik – Social Network for Artists

**Artik** is a cross-platform application developed to work as a social network designed to protect, showcase, and monetize art in a safe and ethical environment—especially against the growing threat of generative AI.

## 🎨 What is Artik?

Artik was created to address the real issues faced by digital artists: lack of visibility on mainstream social media, vulnerability to plagiarism and AI exploitation, and the absence of secure platforms for selling art.

Main features include:
- Social feed with likes, comments, and reposts.
- Product and commission sales.
- Galleries organized by category and art style.
- Community art challenges.
- Private messaging and commission workflow.
- Image protection inspired by Glaze and Nightshade.
- Cross-platform UI (React Native + Web).
- Backend built with Flask and Supabase.

## 📦 Requirements

- Node.js ≥ v16
- npm ≥ v7
- Expo CLI
- Python ≥ 3.9 (for the Flask backend that simulates Glaze protection)
- Supabase account (for auth and storage)
- Git

> The needed packages will be installed after running the **npm install -i** command.


## 📥 Installation

```bash
git clone https://github.com/crisuroll/Artik.git
cd Artik
```

### Client (React Native + Web frontend)

```bash
npm install -i
npx expo start
```
You’ll see some options in the terminal:
- Press **a** to launch the app on an Android emulator
- Press **i** to launch the app on an iOS emulator
- Press **w** to open the app in your web browser

### Image protection server (Flask backend)

```bash
python .\services\glaze.py
```

> Make sure the Flask server is running before uploading images from the client.

## 🔐 License

This software is released under a **Restricted Use License (proprietary)**. Commercial use, redistribution without explicit consent, or integration into AI training datasets is strictly prohibited.

**Not allowed:**
- Modifying or using this project to train or feed generative AI models.
- Using it to copy or imitate artistic styles without consent.
- Commercial distribution, partial or full, without written permission.

For educational or collaborative purposes, please contact the author.

---

## 📄 Credits

Project developed by **Cristina Cañadas García** as Final Year Project (June 2025). 
Technologies: React Native, Supabase, Flask, Glaze/Nightshade (concept), Expo.
