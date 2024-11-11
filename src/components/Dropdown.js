import { useState } from "react";

export default props => {
    const { label, options, onSelection } = props;

    const onSelectionChange = event => onSelection(event.target.value);

    return (
        <div className="is-flex is-align-items-center gap-15">
            <label className="subtitle m-0" htmlFor="selection">{label}</label>
            <div className="select">
                <select name="selection" onChange={onSelectionChange}>
                    {options.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};