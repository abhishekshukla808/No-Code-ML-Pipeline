# No-Code Machine Learning Pipeline Builder (Web-Based)

No-Code Machine Learning Pipeline Builder (Web-Based) is an interactive web application that allows users to build, configure, and run a complete machine learning workflow directly in the browser—without writing any code. Users can upload datasets, apply preprocessing steps, split data, select a model, and view results through a clear, step-by-step visual interface.

This project is designed for students, beginners in machine learning, product managers, and non-technical users who want to understand and experiment with ML concepts, as well as developers who want a quick way to prototype and demonstrate ML pipelines with a clean, intuitive UI.

## Features

Key Features

No-Code ML Workflow
Build and execute machine learning pipelines without writing any code using a step-based visual interface.

Dataset Upload & Preview
Upload CSV or Excel files and instantly view dataset details such as rows, columns, and column names.

Data Preprocessing Options
Apply Standardization (StandardScaler) or Normalization (MinMaxScaler) through simple UI controls.

Configurable Train–Test Split
Choose common split ratios (e.g., 70–30, 80–20) and clearly see when the dataset is split.

Model Selection
Select and train one model at a time:

Logistic Regression

Decision Tree Classifier

In-Browser Model Training
Models are implemented in pure JavaScript and run entirely in the browser with no backend dependency.

Clear Model Results & Feedback
View execution status, accuracy/performance metrics, and meaningful visualizations.

Visual Pipeline Flow
Users can visually track progress from data upload to final output, mimicking a drag-and-drop ML pipeline experience.

Interactive & Responsive UI
Clean, modern interface built with React, Tailwind CSS, and shadcn/ui for a smooth user experience.

Fast & Secure Execution
Client-side processing ensures quick feedback and keeps user data local to the browser.



## Deployment

Step 1: Clone the repository using the project's Git URL.

```
git clone <YOUR_GIT_URL>
```

Step 3: Install the necessary dependencies.
```
npm i
```
Step 4: Start the development server with auto-reloading and an instant preview.

```
npm run dev
```





