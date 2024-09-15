import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Define the structure of an Artwork object
interface Artwork {
  id: string;
  title: string;
  artist_display: string;
  place_of_origin: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const App: React.FC = () => {
  // State variables
  const [artworks, setArtworks] = useState<Artwork[]>([]); // Current page of artworks
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]); // Selected artworks
  const [totalRecords, setTotalRecords] = useState<number>(0); // Total number of artworks
  const [loading, setLoading] = useState<boolean>(true); // Loading state for data fetching
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 12,
    page: 1,
    sortField: null,
    sortOrder: null,
  }); // State for lazy loading and pagination
  const [customRowCount, setCustomRowCount] = useState<number>(12); // Custom row count for selection

  // Refs
  const op = useRef<OverlayPanel>(null); // Reference to the OverlayPanel
  const allArtworksRef = useRef<Artwork[]>([]); // Stores all fetched artworks
  const lastSelectionStartPage = useRef<number>(1); // Tracks the starting page of the last selection

  // Fetch data from the API
  const fetchData = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}`);
      const { data, pagination } = response.data;
      setArtworks(data);
      setTotalRecords(pagination.total);
      // Update allArtworksRef with new data, preserving existing data for other pages
      allArtworksRef.current = [
        ...allArtworksRef.current.slice(0, (page - 1) * pageSize),
        ...data,
        ...allArtworksRef.current.slice(page * pageSize)
      ];
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when lazyState changes
  useEffect(() => {
    fetchData(lazyState.page, lazyState.rows);
  }, [lazyState]);

  // Handle page change
  const onPage = (event: DataTablePageEvent) => {
    const newPage = (event.page ?? 0) + 1;
    setLazyState(prevState => ({
      ...prevState,
      first: event.first,
      page: newPage,
      rows: event.rows
    }));
  };

  // Apply custom row count selection
  const applyCustomRowCount = () => {
    // Determine the starting page for selection
    const startPage = selectedRows.length === 0 ? lazyState.page : lastSelectionStartPage.current;
    const startIndex = (startPage - 1) * lazyState.rows;
    const endIndex = Math.min(startIndex + customRowCount, allArtworksRef.current.length);
    
    // Select rows based on custom count
    const newSelectedRows = allArtworksRef.current.slice(startIndex, endIndex);
    
    setSelectedRows(newSelectedRows);
    lastSelectionStartPage.current = startPage;

    // Navigate to the page containing the last selected row
    const targetPage = Math.floor((endIndex - 1) / lazyState.rows) + 1;
    
    setLazyState(prevState => ({
      ...prevState,
      first: (targetPage - 1) * lazyState.rows,
      page: targetPage,
    }));

    op.current?.hide(); // Hide the overlay panel
  };

  // Handle selection change
  const onSelectionChange = (e: { value: Artwork[] }) => {
    setSelectedRows(e.value);
    // If all selections are removed, update the last selection start page
    if (e.value.length === 0) {
      lastSelectionStartPage.current = lazyState.page;
    }
  };

  // Custom header template for the selection column
  const headerTemplate = (
    <div className="flex justify-between items-center w-full px-2">
      <div className="p-checkbox p-component"></div>
      <Button
        type="button"
        icon="pi pi-chevron-down"
        onClick={(e) => op.current?.toggle(e)}
        className="p-button-text p-button-plain p-button-sm"
        style={{ padding: '0.5rem', marginRight: '10px' }}
        aria-haspopup
        aria-controls="overlay_panel"
      />
      <OverlayPanel ref={op} id="overlay_panel" className="w-72">
        <div className="flex flex-col gap-2">
          <label htmlFor="custom-row-count"><h3>Custom Row Count </h3></label>
          <InputNumber
            placeholder='Select rows...'
            id="custom-row-count"
            // value={customRowCount}
            onValueChange={(e) => setCustomRowCount(e.value ?? 12)}
            min={1}
            max={totalRecords}
          />
          <Button label="Submit" onClick={applyCustomRowCount} className="p-button-sm" 
          style={{display:'block',margin:'10px 0 0 52%',border:'1px solid black',  fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', backgroundColor:'white'}}/>
        </div>
      </OverlayPanel>
    </div>
  );

  // Render the component
  return (
    <div className="data-table-container">
      <DataTable
        value={artworks}
        lazy
        paginator
        first={lazyState.first}
        rows={lazyState.rows}
        totalRecords={totalRecords}
        onPage={onPage}
        selectionMode="multiple"
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        loading={loading}
        dataKey="id"
        scrollable
        scrollHeight="flex"
      >
        <Column 
          selectionMode="multiple" 
          headerStyle={{ width: '8.7em', padding: '0' }}
          bodyStyle={{ textAlign: 'center' }}
          header={headerTemplate}
        ></Column>
        <Column field="title" header="Title"></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>
    </div>
  );
};

export default App;