const Cursor = ({ fillColor = "#0169A8" }: { fillColor?: string }) => (
  <svg fill="none" height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.92098 2.29927C6.93571 1.53286 5.5 2.23498 5.5 3.48325V20.492C5.5 21.9142 7.2945 22.538 8.17661 21.4224L12.3676 16.1222C12.6806 15.7264 13.1574 15.4956 13.6619 15.4956H20.5143C21.9425 15.4956 22.5626 13.6885 21.4353 12.8116L7.92098 2.29927Z"
      fill={fillColor}
    />
  </svg>
);

export default Cursor;
