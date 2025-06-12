type PopupProps = {
  title: string;
  date: string;
  description: string;
  location: string;
  dimensions: number;
  soilPh: string;
  soilType: string;
  conditions: string;
  imageUrl: string;
  userID: string;
  canJoin: { canJoin: boolean; message: string };
  message: string;
  plotId: string;
  onClose: React.MouseEventHandler<HTMLDivElement>;
};

const Popup: React.FC<PopupProps> = ({
  title,
  date,
  description,
  location,
  dimensions,
  soilPh,
  soilType,
  conditions,
  imageUrl,
  onClose,
}) => {
  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-gray-300 opacity-70"
        onClick={onClose}
      ></div>

      <div className="fixed left-1/2 top-24 z-40 h-auto w-[90%] max-w-5xl -translate-x-1/2 transform rounded-2xl bg-primary p-8 opacity-100 shadow-lg md:top-1/4 md:h-auto md:w-[80%]">
        <div className="grid gap-4 md:grid-cols-[5fr_1fr_2fr]">
          <img
            src={imageUrl}
            alt={title}
            className={`position-self-center sm:max-w-1/3 col-span-3 col-start-1 w-[85%] rounded-xl object-cover min-[560px]:w-full md:col-span-3 md:block lg:col-span-1`}
          />
          <div className="col-span-1 col-start-1 lg:col-start-3">
            <h2 className="text-xl font-bold text-white md:text-2xl">
              {title}
            </h2>
            <p className="text-base text-white md:text-lg">{date}</p>
            <p className="mt-2 text-base text-white md:text-lg">
              Location: {location}
            </p>
            <p className="text-base text-white md:text-lg">
              Garden Size: {dimensions}m²
            </p>
            <p className="text-base text-white md:text-lg">Soil pH: {soilPh}</p>
            <p className="text-base text-white md:text-lg">
              Soil Type: {soilType}
            </p>
            <p className="mb-2 text-base text-white md:text-lg">
              Conditions: {conditions}
            </p>
          </div>

          <div>
            <h2 className="col-span-2 mb-2 text-xl font-bold text-white md:text-2xl">
              Description:
            </h2>
            <p className="text-base text-white md:text-lg">{description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Popup;
