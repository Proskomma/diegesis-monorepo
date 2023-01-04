import {Select, MenuItem} from "@mui/material";

export default function SortSelector({sortField, setSortField}) {

    return (
        <Select
            id="sort_selector"
            value={sortField}
            label="Sort by"
            size="small"
            color="primary"
            sx={{marginLeft: "1em", backgroundColor: "#FFF"}}
            onChange={(event) => setSortField(event.target.value)}
        >
            {
                [["title", "Title"], ["languageCode", "Language Code"], ["org", "Source"], ["owner", "Owner"], ["id", "ID"]]
                    .map(
                        (option, index) => (
                            <MenuItem
                                key={index}
                                value={option[0]}
                            >
                                {option[1]}
                            </MenuItem>
                        )
                    )
            }

        </Select>
    )
}
