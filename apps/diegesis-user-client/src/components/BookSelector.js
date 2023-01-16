import { Select, MenuItem } from "@mui/material";

export default function OrgSelector({bookCodes, selectedBook, setSelectedBook}) {

    return (
        <Select
            id="book_selector"
            value={selectedBook}
            label="Book"
            size="small"
            color="primary"
            onChange={(event) => setSelectedBook(event.target.value)}
        >
             {bookCodes.map((option, index) => (
                <MenuItem
                    key={index}
                    value={option}
                >
                    {option}
                </MenuItem>
            ))}

        </Select>
    )
}
