# DataTable Custom Row Selection App

This is a React application that demonstrates the implementation of a DataTable with custom row selection using PrimeReact. The application supports pagination, server-side fetching of data, and custom selection of rows across multiple pages. It is built with TypeScript and uses Vite as the build tool.

## Features

- PrimeReact DataTable with server-side pagination.
- Custom row selection feature across pages.
* Persistent row selection even when navigating between pages.
+ Supports dynamic custom row count selection using an overlay panel.
- Integrated API calls to fetch artwork data.

## Technologies Used
+ React 18
- TypeScript
* PrimeReact
+ Vite
- Axios (for API requests)

## API Integration
This project fetches data from the Art Institute of Chicago API to display artwork information in the DataTable.

## Deployment
This application is deployed on Netlify. You can view the live version here :
### https://mayanksdatatable.netlify.app/

## How to Use
- Navigate through pages using the paginator at the bottom of the table.
- Use the custom row selection feature by clicking the dropdown icon in the table's header.
- Enter the desired number of rows to select across pages, and click Apply.
- The selection will persist across pages, and new selections will start from the current page if all rows are deselected.
