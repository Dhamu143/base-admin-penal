import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import swal from "sweetalert";
import PageLoader from "../../components/PageLoader/PageLoader";
import Paginate from "../../components/pagination/paginate";
import {
  appAllGetRequestedHubs,
  appDeleteRequestedHub,
} from "../../store/requestedhub";
import {
  appAllGetPaymentSettings,
  appCreatePaymentSettings,
} from "../../store/paymentsetting";

function TableFilter() {
  const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const params = useParams();
  const isloder = useSelector((state) => state.requestedhubReducer.isloder);
  const payment = useSelector((state) => state.paymentSettingsReducer.payment);
  // console.log(payment);

  const [formData, setFormData] = useState({
    tax: "",
    sponsorshipAllCommunity: "",
    oneCommunityPrice: "",
    oneCommunityPercent: "",
    oneSansthaPrice: "",
    oneSansthaPercent: "",
    yearlyPrice: "",
    yearlyyPercent: "",
    monthlyPrice: "",
    monthlyPercent: "",
    lifetimePrice: "",
    lifetimePercent: "",
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        tax: payment.tax || "",
        sponsorshipAllCommunity: payment.allcommunity || "",
        oneCommunityPrice: payment.community?.price || "",
        oneCommunityPercent: payment.community?.share || "",
        oneSansthaPrice: payment.sanstha?.price || "",
        oneSansthaPercent: payment.sanstha?.share || "",
        yearlyPrice: payment.Yearly?.price || "",
        yearlyyPercent: payment.Yearly?.share || "",
        monthlyPrice: payment.Monthly?.price || "",
        monthlyPercent: payment.Monthly?.share || "",
        lifetimePrice: payment.Lifetime?.price || "",
        lifetimePercent: payment.Lifetime?.share || "",
      });
    }
  }, [payment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    dispatch(appAllGetPaymentSettings());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      tax: Number(formData.tax),
      allcommunity: Number(formData.sponsorshipAllCommunity),
      community: {
        price: Number(formData.oneCommunityPrice),
        share: Number(formData.oneCommunityPercent),
      },
      sanstha: {
        price: Number(formData.oneSansthaPrice),
        share: Number(formData.oneSansthaPercent),
      },
      Yearly: {
          price: Number(formData.yearlyPrice),
          share: Number(formData.yearlyyPercent),
      },
       Monthly: {
          price: Number(formData.monthlyPrice),
          share: Number(formData.monthlyPercent),
      },
       Lifetime: {
          price: Number(formData.lifetimePrice),
          share: Number(formData.lifetimePercent),
      }
    };

    console.log(payload);
    dispatch(appCreatePaymentSettings(payload));
  };

  return (
    <>
      {isloder && <PageLoader />}
      <form onSubmit={handleSubmit}>
        {/* Tax Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">General Tax Setting</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="tax">Tax (%)*</label>
                  <input
                    className="form-control"
                    type="number"
                    id="tax"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter tax percentage"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsorship Price Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Sponsorship Price </h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="sponsorshipAllCommunity">
                    All Community *
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    id="sponsorshipAllCommunity"
                    name="sponsorshipAllCommunity"
                    value={formData.sponsorshipAllCommunity}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter price for all community"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="card mb-4">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="oneCommunityPrice">
                      One Community Sponsorship Price *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="oneCommunityPrice"
                      name="oneCommunityPrice"
                      value={formData.oneCommunityPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="oneCommunityPercent">
                      Community Share(%) *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="oneCommunityPercent"
                      name="oneCommunityPercent"
                      value={formData.oneCommunityPercent}
                      onChange={handleInputChange}
                      required
                      // placeholder="Enter percentage for one community"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="oneSansthaPrice">
                      One Sanstha Sponsorship Price *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="oneSansthaPrice"
                      name="oneSansthaPrice"
                      value={formData.oneSansthaPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="oneSansthaPercent">
                      Sanstha Share (%) *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="oneSansthaPercent"
                      name="oneSansthaPercent"
                      value={formData.oneSansthaPercent}
                      onChange={handleInputChange}
                      required
                      // placeholder="Enter percentage for one sanstha"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Event Price Section */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Event Price </h5>
          </div>

          <div className="card-body">
            <div className="card mb-4">
             
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="monthlyPrice">
                      Monthly Event Price *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="monthlyPrice"
                      name="monthlyPrice"
                      value={formData.monthlyPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="monthlyPercent">
                      Monthly Event Share (%) *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="monthlyPercent"
                      name="monthlyPercent"
                      value={formData.monthlyPercent}
                      onChange={handleInputChange}
                      required
                      // placeholder="Enter percentage for one sanstha"
                    />
                  </div>
                </div>
              </div>

               <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="yearlyPrice">Yearly Event Price *</label>
                    <input
                      className="form-control"
                      type="number"
                      id="yearlyPrice"
                      name="yearlyPrice"
                      value={formData.yearlyPrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="yearlyyPercent">
                      Yearly Event Share(%) *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="yearlyyPercent"
                      name="yearlyyPercent"
                      value={formData.yearlyyPercent}
                      onChange={handleInputChange}
                      required
                      // placeholder="Enter percentage for one community"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="lifetimePrice">
                      Lifetime Event Price *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="lifetimePrice"
                      name="lifetimePrice"
                      value={formData.lifetimePrice}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="lifetimePercent">
                      Lifetime Event Share (%) *
                    </label>
                    <input
                      className="form-control"
                      type="number"
                      id="lifetimePercent"
                      name="lifetimePercent"
                      value={formData.lifetimePercent}
                      onChange={handleInputChange}
                      required
                      // placeholder="Enter percentage for one sanstha"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="modal-footer d-flex justify-content-center">
          <button className="btn btn-success" type="submit">
            <span className="btn-label">
              <i className="fa fa-check"></i>
            </span>
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default TableFilter;
