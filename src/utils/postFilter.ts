import { SITE } from "@/config";

type FilterableEntry = {
    data: {
        draft?: boolean;
        pubDatetime: Date;
    };
};

const postFilter = ({ data }: FilterableEntry) => {
    const isPublishTimePassed = Date.now() > new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
    return !data.draft && (import.meta.env.DEV || isPublishTimePassed);
};

export default postFilter;
