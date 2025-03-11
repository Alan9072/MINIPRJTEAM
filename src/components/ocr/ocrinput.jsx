import PropTypes from 'prop-types';

export default function OCRInput({ aiResponse = '' }) {
  const containerStyle = {
    maxHeight: '100px',
    overflowY: 'scroll',
    border: '1px solid #ccc',
    padding: '10px'
  };

  const renderList = (response) => {
    const items = response.split('\n');
    return (
      <ol>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  };

  return (
    <div>
      <h2>Nutritional information and Ingredients:</h2>
      {aiResponse ? (
        <div style={containerStyle}>
          {renderList(aiResponse)}
        </div>
      ) : null}
    </div>
  );
}

OCRInput.propTypes = {
  aiResponse: PropTypes.string
};