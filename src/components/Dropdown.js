import { useState } from "react";

export default props => {
    const { options, onSelection } = props;

    const onSelectionChange = event => {
        const selectedOption = options.find(({ value }) => value === event.target.value);
        onSelection(selectedOption);
    };

    return (
        <div className="select">
            <select onChange={onSelectionChange}>
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
    );
};