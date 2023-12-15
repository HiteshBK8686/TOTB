import PropTypes from 'prop-types';
import Link from 'next/link';

function UploadImages({ restaurant_images, uploadImages, deleteImage }) {
  return (
    <div className="row">
      <div className="col-md-12">
        <p>
          <b>Upload Images:</b>
          <input 
            onChange={uploadImages}
            type="file" 
            className="form-control" 
            style={{padding:'0.2rem .75rem'}}
            id="restaurant_images" 
            name="restaurant_images" 
            multiple
          />
        </p>
      </div>
      <div className="col-md-12 images">
        {restaurant_images.map((image, i) => {
          if(image.image.indexOf(".mp4") !== -1){
            return (
              <div key={i} className="show-image"><video controls style={{height:'150px'}} className="rounded" src={"/static/restaurant_images/"+image.image}></video><input onClick={() => deleteImage(i, image)} className="delete" type="button" value="Delete" /></div>
            )
          } else{
            return (
              <div key={i} className="show-image"><img style={{height:'150px'}} className="rounded" src={"/static/restaurant_images/"+image.image} /><input onClick={() => deleteImage(i, image)} className="delete" type="button" value="Delete" /></div>
            )
          }
        })}
      </div>
    </div>
  );
}

export default UploadImages;
