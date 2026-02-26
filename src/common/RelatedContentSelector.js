import React from "react";
import ReusableSelect from "./ReusableSelect";
import { useRelatedContentLists } from "../hooks/useRelatedContent";

export default function RelatedContentSelector({
    languageId,
    godId, // 🔥 Accepts godId from the parent form
    relatedContent = [],
    onChange,
}) {
    const { data: options = {}, isLoading } = useRelatedContentLists();

    // 🔥 Filter logic to match BOTH Language and God
    const filterAndFormatOptions = (list) => {
        if (!Array.isArray(list)) return [];

        return list
            .filter((item) => {
                let isValid = true;

                // 1. Check Language Match
                if (languageId && item.language) {
                    const itemLang = typeof item.language === "object" ? item.language._id : item.language;
                    if (String(itemLang) !== String(languageId)) isValid = false;
                }

                // 2. Check God Match
                if (godId && item.god) {
                    const itemGod = typeof item.god === "object" ? item.god._id : item.god;
                    if (String(itemGod) !== String(godId)) isValid = false;
                }

                return isValid;
            })
            .map((item) => ({
                value: item._id,
                label: item.title || item.name || "Untitled",
            }));
    };

    const handleDropdownChange = (refModel, newValuesArray) => {
        // Remove existing items for this specific model to avoid duplicates
        const filteredContent = relatedContent.filter((item) => item.refModel !== refModel);

        // Map the newly selected IDs into the correct object format
        const newItems = newValuesArray.map((id) => ({
            refId: id,
            refModel: refModel,
        }));

        // Send the merged array back to the parent form's state
        onChange("relatedContent", [...filteredContent, ...newItems]);
    };

    // Array configuration to render all dropdowns dynamically
    const selectConfigs = [
        { label: "Related Aartis", refModel: "arti", options: filterAndFormatOptions(options.arti) },
        { label: "Related Articles", refModel: "articles", options: filterAndFormatOptions(options.articles) },
        { label: "Related Bhajans", refModel: "bhajan", options: filterAndFormatOptions(options.bhajan) },
        { label: "Related Festivals", refModel: "festival", options: filterAndFormatOptions(options.festivals) },
        { label: "Related Mantras", refModel: "mantra", options: filterAndFormatOptions(options.mantra) },
        { label: "Related News", refModel: "news", options: filterAndFormatOptions(options.news) },
        { label: "Related Sloks", refModel: "sloka", options: filterAndFormatOptions(options.sloka) },
        { label: "Related Stories", refModel: "story", options: filterAndFormatOptions(options.story) },
        { label: "Related Stutis", refModel: "stuti", options: filterAndFormatOptions(options.stuti) },
        { label: "Related Temples", refModel: "temple", options: filterAndFormatOptions(options.temples) },
    ];

    return (
        <div className="row mt-4 pt-4 border-top">
            <div className="col-12">
                <h5 className="mb-3 text-primary">Related Content References</h5>
                <p className="text-muted small mb-4">
                    Link other content to this item. <strong className="text-danger">Note: Select Language and God first.</strong>
                </p>
            </div>

            {selectConfigs.map((config) => {
                // Extract only the IDs for THIS specific dropdown from the master relatedContent array
                const currentSelectedValues = relatedContent
                    .filter((item) => item.refModel === config.refModel)
                    .map((item) => item.refId?._id || item.refId); // Safely handle populated objects vs raw strings

                return (
                    <div className="col-md-4 col-sm-6 mb-3" key={config.refModel}>
                        <ReusableSelect
                            label={config.label}
                            name={config.refModel}
                            isMulti={true}
                            isLoading={isLoading}
                            // 🔥 Disable if BOTH aren't selected yet
                            isDisabled={!languageId || !godId}
                            options={config.options}
                            value={currentSelectedValues}
                            onChange={(name, vals) => handleDropdownChange(config.refModel, vals)}
                            placeholder={`Search...`}
                        />
                    </div>
                );
            })}
        </div>
    );
}