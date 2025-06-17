import { Dispatch, useState } from "react";
import { addDays } from 'date-fns';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { DateRange } from 'react-date-range';

interface StateProps {
    isOpen: boolean;
    setIsOpen: Dispatch<React.SetStateAction<boolean>>;
};

const BookingUI = (stateProps: StateProps) => {
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);
    //const [isBookingOpen, setIsBookingOpen] = useState(true);

    return (
        <Dialog
            open={stateProps.isOpen}
            onClose={() => stateProps.setIsOpen(false)}
            as="div"
            className="relative z-10 focus:outline-none"
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-background px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                            <DialogTitle as="h3" className="text-base font-semibold">
                                Choose the start and end date for your stay.
                            </DialogTitle>
                        </div>

                        <div className="mt-2">
                            <DateRange
                                ranges={state}
                                onChange={item => setState([item.selection])}
                                direction="horizontal"
                                moveRangeOnFirstSelection={false}
                                showSelectionPreview={true}
                            />
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default BookingUI;